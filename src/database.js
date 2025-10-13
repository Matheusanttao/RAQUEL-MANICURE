import { supabase } from './supabase'

// Funções para gerenciar agendamentos
export const bookingService = {
  // Salvar novo agendamento
  async createBooking(bookingData) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      throw error
    }
  },

  // Buscar todos os agendamentos
  async getAllBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      return []
    }
  },

  // Atualizar status do agendamento
  async updateBookingStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      throw error
    }
  },

  // Excluir agendamento
  async deleteBooking(id) {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error)
      throw error
    }
  }
}

// Funções para gerenciar configurações
export const configService = {
  // Salvar configuração de horários
  async saveScheduleConfig(config) {
    try {
      const { data, error } = await supabase
        .from('schedule_config')
        .upsert([{ id: 1, config }])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      throw error
    }
  },

  // Buscar configuração de horários
  async getScheduleConfig() {
    try {
      const { data, error } = await supabase
        .from('schedule_config')
        .select('config')
        .eq('id', 1)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data?.config || null
    } catch (error) {
      console.error('Erro ao buscar configuração:', error)
      return null
    }
  }
}

