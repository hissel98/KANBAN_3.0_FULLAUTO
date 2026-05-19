import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = new URL('/dashboard', requestUrl.origin)

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
