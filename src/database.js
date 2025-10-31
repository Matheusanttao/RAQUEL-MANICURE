import { supabase } from './supabase'

// Funções para gerenciar agendamentos
export const bookingService = {
  // Salvar novo agendamento
  async createBooking(bookingData) {
    try {
      // Verificar se o Supabase está configurado corretamente
      if (supabase.from && typeof supabase.from === 'function' && supabase.from().insert) {
        const { data, error } = await supabase
          .from('bookings')
          .insert([bookingData])
          .select()
        
        if (error) throw error
        return data[0]
      } else {
        // Fallback para localStorage quando Supabase não estiver configurado
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        const newBooking = {
          id: Date.now().toString(),
          ...bookingData,
          createdAt: new Date().toISOString()
        }
        bookings.push(newBooking)
        localStorage.setItem('bookings', JSON.stringify(bookings))
        return newBooking
      }
    } catch (error) {
      // Retornar erro silenciosamente e usar localStorage
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
      const newBooking = {
        id: Date.now().toString(),
        ...bookingData,
        createdAt: new Date().toISOString()
      }
      bookings.push(newBooking)
      localStorage.setItem('bookings', JSON.stringify(bookings))
      return newBooking
    }
  },

  // Buscar todos os agendamentos
  async getAllBookings() {
    try {
      // Verificar se o Supabase está configurado corretamente
      if (supabase.from && typeof supabase.from === 'function' && supabase.from().select) {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('date', { ascending: true })
        
        if (error) throw error
        return data || []
      } else {
        // Fallback para localStorage quando Supabase não estiver configurado
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        return bookings.filter(b => b && b.id).sort((a, b) => {
          if (!a.date || !b.date) return 0;
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
          return dateA - dateB;
        })
      }
    } catch (error) {
      // Retornar array vazio em caso de erro
      return []
    }
  },

  // Atualizar status do agendamento
  async updateBookingStatus(id, status) {
    try {
      // Verificar se o Supabase está configurado corretamente
      if (supabase.from && typeof supabase.from === 'function' && supabase.from().update) {
        const { data, error } = await supabase
          .from('bookings')
          .update({ status })
          .eq('id', id)
          .select()
        
        if (error) throw error
        return data[0]
      } else {
        // Fallback para localStorage quando Supabase não estiver configurado
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        const bookingIndex = bookings.findIndex(b => b.id === id)
        if (bookingIndex !== -1) {
          bookings[bookingIndex].status = status
          localStorage.setItem('bookings', JSON.stringify(bookings))
          return bookings[bookingIndex]
        }
        throw new Error('Agendamento não encontrado')
      }
    } catch (error) {
      // Fallback para localStorage
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
      const bookingIndex = bookings.findIndex(b => b.id === id)
      if (bookingIndex !== -1) {
        bookings[bookingIndex].status = status
        localStorage.setItem('bookings', JSON.stringify(bookings))
        return bookings[bookingIndex]
      }
      throw new Error('Agendamento não encontrado')
    }
  },

  // Excluir agendamento
  async deleteBooking(id) {
    try {
      // Verificar se o Supabase está configurado corretamente
      if (supabase.from && typeof supabase.from === 'function' && supabase.from().delete) {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        return true
      } else {
        // Fallback para localStorage quando Supabase não estiver configurado
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        const filteredBookings = bookings.filter(b => b.id !== id)
        localStorage.setItem('bookings', JSON.stringify(filteredBookings))
        return true
      }
    } catch (error) {
      // Fallback para localStorage
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
      const filteredBookings = bookings.filter(b => b.id !== id)
      localStorage.setItem('bookings', JSON.stringify(filteredBookings))
      return true
    }
  }
}

// Funções para gerenciar configurações
export const configService = {
  // Salvar configuração de horários
  async saveScheduleConfig(config) {
    try {
      // Verificar se o Supabase está configurado corretamente
      if (supabase.from && typeof supabase.from === 'function' && supabase.from().upsert) {
        const { data, error } = await supabase
          .from('schedule_config')
          .upsert([{ id: 1, config }])
          .select()
        
        if (error) throw error
        return data[0]
      } else {
        // Fallback para localStorage quando Supabase não estiver configurado
        localStorage.setItem('scheduleConfig', JSON.stringify(config))
        return { id: 1, config }
      }
    } catch (error) {
      // Fallback para localStorage
      localStorage.setItem('scheduleConfig', JSON.stringify(config))
      return { id: 1, config }
    }
  },

  // Buscar configuração de horários
  async getScheduleConfig() {
    try {
      // Verificar se o Supabase está configurado corretamente
      if (supabase.from && typeof supabase.from === 'function' && supabase.from().select) {
        const { data, error } = await supabase
          .from('schedule_config')
          .select('config')
          .eq('id', 1)
          .single()
        
        if (error && error.code !== 'PGRST116') throw error
        return data?.config || null
      } else {
        // Fallback para localStorage quando Supabase não estiver configurado
        const config = localStorage.getItem('scheduleConfig')
        return config ? JSON.parse(config) : null
      }
    } catch (error) {
      // Retornar null em caso de erro
      return null
    }
  }
}