import { createClient } from '@supabase/supabase-js'

// --- ЭНД ТҮР ЗУУР ШУУД ХАЯГАА БИЧЬЕ ---
// Supabase-аас авсан хаягаа доорх хашилтан дотор хуулж тавь
const supabaseUrl = "https://таны-төслийн-id.supabase.co" 
const supabaseAnonKey = "таны-маш-урт-anon-key-энд"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
