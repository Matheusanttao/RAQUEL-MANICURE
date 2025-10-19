// Configuração temporária do Supabase - desabilitada para desenvolvimento
// import { createClient } from '@supabase/supabase-js'

// Substitua estas URLs pelas suas do Supabase quando estiver pronto
// const supabaseUrl = 'SUA_URL_DO_SUPABASE'
// const supabaseKey = 'SUA_CHAVE_DO_SUPABASE'

// export const supabase = createClient(supabaseUrl, supabaseKey)

// Mock temporário do Supabase para desenvolvimento
export const supabase = {
  from: () => ({
    insert: () => ({ select: () => ({ data: [{}], error: null }) }),
    select: () => ({ order: () => ({ data: [], error: null }) }),
    update: () => ({ eq: () => ({ select: () => ({ data: [{}], error: null }) }) }),
    delete: () => ({ eq: () => ({ error: null }) }),
    upsert: () => ({ select: () => ({ data: [{}], error: null }) })
  })
}