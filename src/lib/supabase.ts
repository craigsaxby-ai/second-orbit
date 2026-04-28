import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://xwcmvemayjjcfyjhdkii.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = key ? createClient(url, key) : null
