import { supabase } from './supabase'

// Funções para gerenciar agendamentos
export const bookingService = {
  // Salvar novo agendamento
  async createBooking(bookingData) {
    try {
<<<<<<< HEAD
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
=======
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
      
      if (error) throw error
      return data[0]
>>>>>>> 97846bb5094ce0614dcdf6709270700564fb9566
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      throw error
    }
  },

  // Buscar todos os agendamentos
  async getAllBookings() {
    try {
<<<<<<< HEAD
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
        return bookings.sort((a, b) => new Date(a.date) - new Date(b.date))
      }
=======
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true })
      
      if (error) throw error
      return data || []
>>>>>>> 97846bb5094ce0614dcdf6709270700564fb9566
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      return []
    }
  },

  // Atualizar status do agendamento
  async updateBookingStatus(id, status) {
    try {
<<<<<<< HEAD
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
=======
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
>>>>>>> 97846bb5094ce0614dcdf6709270700564fb9566
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      throw error
    }
  },

  // Excluir agendamento
  async deleteBooking(id) {
    try {
<<<<<<< HEAD
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
=======
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
>>>>>>> 97846bb5094ce0614dcdf6709270700564fb9566
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
<<<<<<< HEAD
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
=======
      const { data, error } = await supabase
        .from('schedule_config')
        .upsert([{ id: 1, config }])
        .select()
      
      if (error) throw error
      return data[0]
>>>>>>> 97846bb5094ce0614dcdf6709270700564fb9566
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      throw error
    }
  },

  // Buscar configuração de horários
  async getScheduleConfig() {
    try {
<<<<<<< HEAD
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
=======
      const { data, error } = await supabase
        .from('schedule_config')
        .select('config')
        .eq('id', 1)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data?.config || null
>>>>>>> 97846bb5094ce0614dcdf6709270700564fb9566
    } catch (error) {
      console.error('Erro ao buscar configuração:', error)
      return null
    }
  }
}

