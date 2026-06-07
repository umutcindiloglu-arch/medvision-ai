-- MedVision AI — Veritabanı Şeması
-- Supabase SQL Editor'de çalıştırın

-- ============================================================
-- TABLOLAR
-- ============================================================

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  image_name TEXT,
  doctor_note TEXT,
  report_en TEXT,
  report_tr TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Kullanıcı yalnızca kendi analizlerini görebilir
CREATE POLICY "Kullanıcı kendi analizlerini yönetebilir"
  ON analyses
  FOR ALL
  USING (auth.uid() = user_id);

-- Kullanıcı yalnızca kendi analizlerine ait mesajları görebilir
CREATE POLICY "Kullanıcı kendi mesajlarını yönetebilir"
  ON messages
  FOR ALL
  USING (
    auth.uid() = (
      SELECT user_id FROM analyses WHERE id = analysis_id
    )
  );

-- Bağımsız asistan sohbetleri için oturum tablosu
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Yeni Sohbet',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcı kendi sohbet oturumlarını yönetebilir"
  ON chat_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi sohbet mesajlarını yönetebilir"
  ON chat_messages FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = session_id)
  );

-- ============================================================
-- İNDEKSLER (performans için)
-- ============================================================

CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON analyses(user_id);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_analysis_id_idx ON messages(analysis_id);
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS chat_sessions_updated_at_idx ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);

-- ============================================================
-- STORAGE
-- ============================================================
-- Supabase Dashboard > Storage'da manuel olarak yapın:
-- 1. "medical-images" adlı bucket oluşturun (Private)
-- 2. Aşağıdaki RLS politikasını Storage > Policies'e ekleyin:

-- INSERT politikası: Giriş yapmış kullanıcılar kendi klasörlerine yükleyebilir
-- CREATE POLICY "Authenticated users can upload their images"
--   ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- SELECT politikası: Kullanıcılar yalnızca kendi görüntülerini görebilir
-- CREATE POLICY "Users can view their own images"
--   ON storage.objects FOR SELECT TO authenticated
--   USING (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);
