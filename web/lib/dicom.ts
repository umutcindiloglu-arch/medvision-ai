import dicomParser from 'dicom-parser'

export async function dicomToImageFile(dcmFile: File): Promise<File> {
  const arrayBuffer = await dcmFile.arrayBuffer()
  const byteArray = new Uint8Array(arrayBuffer)
  const dataset = dicomParser.parseDicom(byteArray, { untilTag: 'x7fe00010' })

  const rows = dataset.uint16('x00280010') ?? 0
  const cols = dataset.uint16('x00280011') ?? 0
  const bitsAllocated = dataset.uint16('x00280100') ?? 8
  const bitsStored = dataset.uint16('x00280101') ?? bitsAllocated
  const pixelRepresentation = dataset.uint16('x00280103') ?? 0 // 0=unsigned, 1=signed
  const photometric = (dataset.string('x00280004') ?? 'MONOCHROME2').trim()
  const samplesPerPixel = dataset.uint16('x00280002') ?? 1
  const rescaleSlope = parseFloat(dataset.string('x00281053') ?? '1') || 1
  const rescaleIntercept = parseFloat(dataset.string('x00281052') ?? '0') || 0

  // Parse window center / width (may be multi-value)
  const wcStr = dataset.string('x00281050')
  const wwStr = dataset.string('x00281051')
  let windowCenter = wcStr ? parseFloat(wcStr.split('\\')[0]) : null
  let windowWidth  = wwStr ? parseFloat(wwStr.split('\\')[0]) : null

  const pixelDataElement = dataset.elements['x7fe00010']
  if (!pixelDataElement) throw new Error('DICOM dosyasında pixel verisi bulunamadı.')

  // Extract raw pixel bytes
  const pixelBytes = new Uint8Array(byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length)

  // Build typed array depending on bit depth
  let rawPixels: Int16Array | Uint16Array | Uint8Array
  if (bitsAllocated === 16) {
    const buf = pixelBytes.buffer.slice(pixelDataElement.dataOffset, pixelDataElement.dataOffset + pixelDataElement.length)
    rawPixels = pixelRepresentation === 1 ? new Int16Array(buf) : new Uint16Array(buf)
  } else {
    rawPixels = pixelBytes
  }

  // Apply rescale (Hounsfield units for CT)
  const rescaled = new Float32Array(rawPixels.length)
  const storedMax = Math.pow(2, bitsStored) - 1
  for (let i = 0; i < rawPixels.length; i++) {
    rescaled[i] = rawPixels[i] * rescaleSlope + rescaleIntercept
  }

  // Auto window/level from data range if not provided
  if (windowCenter === null || windowWidth === null || isNaN(windowCenter) || isNaN(windowWidth)) {
    let min = rescaled[0], max = rescaled[0]
    for (let i = 1; i < rescaled.length; i++) {
      if (rescaled[i] < min) min = rescaled[i]
      if (rescaled[i] > max) max = rescaled[i]
    }
    windowCenter = (min + max) / 2
    windowWidth  = max - min || storedMax
  }

  const wLow  = windowCenter - windowWidth / 2
  const wHigh = windowCenter + windowWidth / 2

  // Render to canvas
  const canvas = document.createElement('canvas')
  canvas.width  = cols
  canvas.height = rows
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(cols, rows)
  const data = imageData.data

  if (samplesPerPixel === 3) {
    // RGB — rarely used but valid
    const invert = photometric === 'RGB' ? false : false
    for (let i = 0; i < rows * cols; i++) {
      data[i * 4]     = rawPixels[i * 3]
      data[i * 4 + 1] = rawPixels[i * 3 + 1]
      data[i * 4 + 2] = rawPixels[i * 3 + 2]
      data[i * 4 + 3] = 255
      void invert
    }
  } else {
    const invert = photometric === 'MONOCHROME1'
    for (let i = 0; i < rows * cols; i++) {
      let v = Math.round(((rescaled[i] - wLow) / (wHigh - wLow)) * 255)
      v = Math.max(0, Math.min(255, v))
      if (invert) v = 255 - v
      data[i * 4]     = v
      data[i * 4 + 1] = v
      data[i * 4 + 2] = v
      data[i * 4 + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Canvas dönüşümü başarısız.')); return }
      const baseName = dcmFile.name.replace(/\.dcm$/i, '')
      resolve(new File([blob], `${baseName}.png`, { type: 'image/png' }))
    }, 'image/png')
  })
}

export function isDicom(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith('.dcm') ||
    file.type === 'application/dicom'
  )
}
