'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { readJson, readError, fetchWithWarmupRetry } from '@/lib/api'
import { isDicom, dicomToImageFile } from '@/lib/dicom'
import { useTranslation } from '@/lib/i18n/context'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const ACCEPTED = 'image/jpeg,image/png,image/webp,application/dicom,.dcm,application/pdf'

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ChatPage() {
  const { T } = useTranslation()
  const CH = T.chat
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachment, setAttachment] = useState<{ file: File; preview: string; isPdf: boolean } | null>(null)
  const [pdfText, setPdfText] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [warming, setWarming] = useState(true)
  const [retryMsg, setRetryMsg] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/warmup').finally(() => setWarming(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error(T.common.error)
      return
    }

    if (file.type === 'application/pdf') {
      setAttachment({ file, preview: '', isPdf: true })
      setPdfText(null)
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/extract-pdf', { method: 'POST', body: formData })
        if (!res.ok) { toast.error(T.common.error); setAttachment(null); return }
        const { text } = await res.json()
        setPdfText(text)
      } catch {
        toast.error(T.common.error)
        setAttachment(null)
      }
      return
    }

    let processedFile = file
    if (isDicom(file)) {
      try {
        processedFile = await dicomToImageFile(file)
      } catch {
        toast.error(T.common.error)
        return
      }
    }

    setAttachment({
      file: processedFile,
      preview: URL.createObjectURL(processedFile),
      isPdf: false,
    })
    setPdfText(null)
  }

  function removeAttachment() {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview)
    setAttachment(null)
    setPdfText(null)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if ((!text && !attachment) || loading) return

    const userContent = text || (attachment ? `[${attachment.file.name}]` : '')
    setInput('')
    setLoading(true)

    const currentAttachment = attachment
    const currentPdfText = pdfText
    setAttachment(null)
    setPdfText(null)

    const userMsg: Message = { role: 'user', content: userContent }
    setMessages((prev) => [...prev, userMsg])

    try {
      let attachmentB64: string | undefined
      let messageText = userContent

      if (currentAttachment) {
        if (currentAttachment.isPdf && currentPdfText) {
          messageText = text
            ? `${text}\n\n[${currentAttachment.file.name}]\n${currentPdfText}`
            : `[${currentAttachment.file.name}]\n${currentPdfText}`
        } else {
          attachmentB64 = await toBase64(currentAttachment.file)
        }
      }

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.role === 'user' && m === userMsg ? messageText : m.content,
      }))

      const res = await fetchWithWarmupRetry(
        '/api/assistant',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, attachment_b64: attachmentB64, session_id: sessionId }),
        },
        (s) => setRetryMsg(s === null ? null : `Model ısınıyor, ${s}s içinde otomatik tekrar deniyor...`),
      )

      setRetryMsg(null)
      if (!res.ok) throw new Error(await readError(res, T.common.error))

      const { reply, session_id: newSessionId } = await readJson<{ reply: string; session_id: string | null }>(res)
      if (newSessionId && !sessionId) setSessionId(newSessionId)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : T.common.error)
      setRetryMsg(null)
      setMessages((prev) => prev.filter((m) => m !== userMsg))
    } finally {
      setLoading(false)
      if (currentAttachment?.preview) URL.revokeObjectURL(currentAttachment.preview)
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-semibold text-slate-800">{CH.title}</h1>
        <p className="text-slate-500 mt-1 text-sm">{CH.desc}</p>
      </div>

      {warming && messages.length === 0 && (
        <div className="mb-3 flex items-center gap-2.5 px-4 py-2.5 bg-sky-50 border border-sky-200 rounded-xl flex-shrink-0">
          <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-xs text-sky-700">{CH.warming}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-700">{CH.empty_title}</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">{CH.empty_desc}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {CH.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="text-left text-xs text-slate-500 border border-slate-200 rounded-xl px-3 py-2
                    hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className={`rounded-2xl rounded-bl-sm px-4 py-2.5 ${retryMsg ? 'bg-amber-50 border border-amber-200' : 'bg-slate-100'}`}>
              {retryMsg ? (
                <p className="text-xs text-amber-700">{retryMsg}</p>
              ) : (
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {attachment && (
        <div className="mb-2 flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl flex-shrink-0">
          {attachment.isPdf ? (
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={attachment.preview} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-700 truncate">{attachment.file.name}</p>
            {attachment.isPdf && !pdfText && (
              <p className="text-xs text-blue-500">{CH.pdf_reading}</p>
            )}
            {pdfText && (
              <p className="text-xs text-green-600">
                {CH.pdf_ready.replace('{n}', (pdfText.length / 1000).toFixed(1))}
              </p>
            )}
          </div>
          <button onClick={removeAttachment} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2 flex-shrink-0">
        <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={handleFileSelect} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || !!attachment}
          className="px-2.5 py-2.5 text-slate-400 hover:text-blue-500 border border-slate-200 hover:border-blue-300
            rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder={CH.placeholder}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm
            text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-60 disabled:cursor-not-allowed transition"
        />

        <button
          type="submit"
          disabled={loading || (!input.trim() && !attachment) || (!!attachment?.isPdf && !pdfText)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200
            text-white disabled:text-slate-400 rounded-xl transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}
