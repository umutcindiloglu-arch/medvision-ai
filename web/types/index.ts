export interface Analysis {
  id: string
  user_id: string
  image_url: string
  image_name: string | null
  doctor_note: string | null
  report_en: string | null
  report_tr: string | null
  created_at: string
}

export interface Message {
  id: string
  analysis_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface AnalysisWithMessages extends Analysis {
  messages: Message[]
}
