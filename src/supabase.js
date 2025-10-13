import { createClient } from '@supabase/supabase-js'

// Substitua estas URLs pelas suas do Supabase
const supabaseUrl = 'SUA_URL_DO_SUPABASE'
const supabaseKey = 'SUA_CHAVE_DO_SUPABASE'

export const supabase = createClient(supabaseUrl, supabaseKey)

