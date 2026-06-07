'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Message } from '@/types'
import { readJson, readError } from '@/lib/api'

interface ChatPanelProps {
  analysisId: string
  initialMessages: Message[]
}

const ACCEPTED = 'image/jpeg,image/png,image/webp,application/pdf'

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ChatPanel({ analysisId, initialMessages }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachment, setAttachment] = useState<{ file: File; preview: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Panel açılınca Modal container'ını önceden uyandır (cold-start'ı gizle)
  useEffect(() => {
    fetch('/api/warmup').catch(() => {})
  }, [])

  function handleAttachmentSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Dosya 20MB\'den büyük olamaz.')
      return
    }
    const isImage = file.type.startsWith('image/')
    setAttachment({
      file,
      preview: isImage ? URL.createObjectURL(file) : '',
    })
    e.target.value = ''
  }

  function removeAttachment() {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview)
    setAttachment(null)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if ((!text && !attachment) || loading) return

    const messageText = text || (attachment ? `[${attachment.file.name}]` : '')
    setInput('')
    setLoading(true)

    const optimisticUser: Message = {
      id: `temp-${Date.now()}`,
      analysis_id: analysisId,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    }
    const currentAttachment = attachment
    setMessages((prev) => [...prev, optimisticUser])
    setAttachment(null)

    try {
      let attachmentB64: string | undefined
      if (currentAttachment) {
        attachmentB64 = await toBase64(currentAttachment.file)
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisId,
          message: messageText,
          attachment_b64: attachmentB64,
        }),
      })

      if (!res.ok) {
        throw new Error(await readError(res, 'Yanıt alınamadı.'))
      }

      const { reply } = await readJson<{ reply: string }>(res)
      setMessages((prev) => [...prev, {
        id: `temp-${Date.now()}-a`,
        analysis_id: analysisId,
        role: 'assistant',
        content: reply,
        created_at: new Date().toISOString(),
      }])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Hata oluştu.')
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id))
    } finally {
      setLoading(false)
      if (currentAttachment?.preview) URL.revokeObjectURL(currentAttachment.preview)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        MedGemma ile Sohbet
      </h3>

      {/* Mesaj listesi */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            <p>Rapor veya görüntü hakkında soru sorabilirsiniz.</p>
            <p className="text-xs mt-1 text-slate-300">
              Ek görüntü veya PDF de ekleyebilirsiniz.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Attachment önizleme */}
      {attachment && (
        <div className="mb-2 flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
          {attachment.preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={attachment.preview} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
          <p className="text-xs text-slate-600 flex-1 truncate">{attachment.file.name}</p>
          <button onClick={removeAttachment} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Giriş alanı */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={handleAttachmentSelect} />

        {/* Ek dosya butonu */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          title="Görüntü veya PDF ekle"
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
          placeholder="Rapor veya görüntü hakkında soru sorun..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm
            text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-60 disabled:cursor-not-allowed transition"
        />

        <button
          type="submit"
          disabled={loading || (!input.trim() && !attachment)}
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
