-- Instruções para configurar o banco de dados no Supabase

-- 1. Tabela para agendamentos
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela para configurações de horários
CREATE TABLE schedule_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  config JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para melhor performance
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- 4. Política de segurança (Row Level Security)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_config ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acesso (permitir todas as operações para usuários autenticados)
-- Para bookings
CREATE POLICY "Enable all operations for authenticated users" ON bookings
  FOR ALL USING (true);

-- Para schedule_config
CREATE POLICY "Enable all operations for authenticated users" ON schedule_config
  FOR ALL USING (true);

-- 6. Inserir configuração padrão
INSERT INTO schedule_config (config) VALUES (
  '{
    "workingDays": {
      "monday": {"enabled": true, "startTime": "09:00", "endTime": "18:00"},
      "tuesday": {"enabled": true, "startTime": "09:00", "endTime": "18:00"},
      "wednesday": {"enabled": true, "startTime": "09:00", "endTime": "18:00"},
      "thursday": {"enabled": true, "startTime": "09:00", "endTime": "18:00"},
      "friday": {"enabled": true, "startTime": "09:00", "endTime": "18:00"},
      "saturday": {"enabled": true, "startTime": "09:00", "endTime": "15:00"},
      "sunday": {"enabled": false, "startTime": "09:00", "endTime": "18:00"}
    },
    "timeSlots": 30,
    "breakTimes": []
  }'
);

