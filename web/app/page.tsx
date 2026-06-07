import { createClient } from '@/lib/supabase/server'
import LandingClient from '@/components/landing-client'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <LandingClient isLoggedIn={!!user} />
}
