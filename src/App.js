import React, { useState, useEffect } from 'react';
import './App.css';
import { bookingService, configService } from './database';

function App() {
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: '',
    message: ''
  });

  // Estados para validação
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Estados para autenticação e administração
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Estados para consulta de agendamentos
  const [showConsultation, setShowConsultation] = useState(false);
  const [consultationPhone, setConsultationPhone] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [consultationLoading, setConsultationLoading] = useState(false);
  
  // Estado para menu mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados para configuração de horários
  const [scheduleConfig, setScheduleConfig] = useState({
    workingDays: {
      monday: { enabled: true, startTime: '09:00', endTime: '18:00' },
      tuesday: { enabled: true, startTime: '09:00', endTime: '18:00' },
      wednesday: { enabled: true, startTime: '09:00', endTime: '18:00' },
      thursday: { enabled: true, startTime: '09:00', endTime: '18:00' },
      friday: { enabled: true, startTime: '09:00', endTime: '18:00' },
      saturday: { enabled: true, startTime: '09:00', endTime: '15:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '18:00' }
    },
    timeSlots: 30, // minutos entre cada horário
    breakTimes: [] // horários de pausa
  });

  // Estados para agendamentos
  const [bookings, setBookings] = useState([]);

  // Carregar dados do banco de dados
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar configuração de horários
        const config = await configService.getScheduleConfig();
        if (config) {
          setScheduleConfig(config);
        }

        // Carregar agendamentos
        const bookingsData = await bookingService.getAllBookings();
        setBookings(bookingsData);

        // Verificar autenticação
        const savedAuth = localStorage.getItem('isAuthenticated');
        if (savedAuth === 'true') {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Fallback para localStorage se houver erro
        const savedConfig = localStorage.getItem('scheduleConfig');
        const savedBookings = localStorage.getItem('bookings');
        const savedAuth = localStorage.getItem('isAuthenticated');
        
        if (savedConfig) {
          setScheduleConfig(JSON.parse(savedConfig));
        }
        if (savedBookings) {
          setBookings(JSON.parse(savedBookings));
        }
        if (savedAuth === 'true') {
          setIsAuthenticated(true);
        }
      }
    };

    loadData();
  }, []);

  // Função de validação
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Nome é obrigatório';
        } else if (value.trim().length < 3) {
          error = 'Nome deve ter pelo menos 3 caracteres';
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) {
          error = 'Nome deve conter apenas letras';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = 'Telefone é obrigatório';
        } else {
          const phoneDigits = value.replace(/\D/g, '');
          if (phoneDigits.length < 10 || phoneDigits.length > 11) {
            error = 'Telefone inválido (deve ter 10 ou 11 dígitos)';
          }
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'E-mail inválido';
        }
        break;
      case 'service':
        if (!value) {
          error = 'Selecione um serviço';
        }
        break;
      case 'date':
        if (!value) {
          error = 'Data é obrigatória';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            error = 'Não é possível agendar para datas passadas';
          }
        }
        break;
      case 'time':
        if (!value) {
          error = 'Horário é obrigatório';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar campo quando é alterado
    if (touchedFields[name]) {
      const error = validateField(name, value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }

    // Limpar erro de horário se a data mudar
    if (name === 'date') {
      setBookingData(prev => ({ ...prev, time: '' }));
      setValidationErrors(prev => ({ ...prev, time: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Marcar campo como tocado
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar campo
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Função de login
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === 'admin' && loginData.password === 'admin') {
      setIsAuthenticated(true);
      setShowLogin(false);
      setShowAdmin(true);
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      window.alert('Usuário ou senha incorretos!');
    }
  };

  // Função de logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAdmin(false);
    setShowLogin(false);
    localStorage.removeItem('isAuthenticated');
  };

  // Função para consultar agendamentos por telefone
  const handleConsultation = async () => {
    if (!consultationPhone.trim()) {
      window.alert('Por favor, digite seu número de telefone.');
      return;
    }

    setConsultationLoading(true);
    try {
      const allBookings = await bookingService.getAllBookings();
      const userBookings = allBookings.filter(booking => 
        booking.phone.replace(/\D/g, '') === consultationPhone.replace(/\D/g, '')
      );
      setUserBookings(userBookings);
    } catch (error) {
      console.error('Erro ao consultar agendamentos:', error);
      window.alert('Erro ao consultar agendamentos. Tente novamente.');
    } finally {
      setConsultationLoading(false);
    }
  };

  // Função para fechar consulta
  const closeConsultation = () => {
    setShowConsultation(false);
    setConsultationPhone('');
    setUserBookings([]);
  };

  // Função para salvar configuração de horários
  const saveScheduleConfig = async (newConfig) => {
    try {
      setScheduleConfig(newConfig);
      await configService.saveScheduleConfig(newConfig);
      // Também salvar no localStorage como backup
      localStorage.setItem('scheduleConfig', JSON.stringify(newConfig));
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      // Fallback para localStorage
      localStorage.setItem('scheduleConfig', JSON.stringify(newConfig));
    }
  };

  // Função para gerar horários disponíveis
  const generateAvailableTimes = (date) => {
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayConfig = scheduleConfig.workingDays[dayNames[dayOfWeek]];
    
    if (!dayConfig.enabled) return [];
    
    const times = [];
    const startTime = dayConfig.startTime;
    const endTime = dayConfig.endTime;
    const slotDuration = scheduleConfig.timeSlots;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentTime = startHour * 60 + startMin;
    const endTimeMinutes = endHour * 60 + endMin;
    
    while (currentTime < endTimeMinutes) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Verificar se o horário não está ocupado
      const isBooked = bookings.some(booking => 
        booking.date === date && booking.time === timeString
      );
      
      if (!isBooked) {
        times.push(timeString);
      }
      
      currentTime += slotDuration;
    }
    
    return times;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos os campos como tocados
    const allFields = ['name', 'phone', 'email', 'service', 'date', 'time'];
    const newTouchedFields = {};
    const newErrors = {};
    
    allFields.forEach(field => {
      newTouchedFields[field] = true;
      const error = validateField(field, bookingData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setTouchedFields(newTouchedFields);
    setValidationErrors(newErrors);
    
    // Verificar se há erros
    if (Object.keys(newErrors).length > 0) {
      // Rolar até o primeiro erro
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }
    
    try {
      // Criar novo agendamento
      const newBooking = {
        ...bookingData,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      // Salvar no banco de dados
      const savedBooking = await bookingService.createBooking(newBooking);
      
      // Atualizar estado local
      setBookings(prev => [...prev, savedBooking]);
      
      // Também salvar no localStorage como backup
      const updatedBookings = [...bookings, savedBooking];
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      
      // Mostrar mensagem de sucesso
      window.alert('Agendamento enviado com sucesso! Entraremos em contato em breve.');
      
      // Limpar formulário
      setBookingData({
        name: '',
        phone: '',
        email: '',
        service: '',
        date: '',
        time: '',
        message: ''
      });
      setTouchedFields({});
      setValidationErrors({});
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      window.alert('Erro ao enviar agendamento. Tente novamente.');
    }
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="nav">
            <a href="#home" className="logo">Raquel Pinheiro</a>
            <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
              <li><a href="#home" onClick={() => setMobileMenuOpen(false)}>Início</a></li>
              <li><a href="#gallery" onClick={() => setMobileMenuOpen(false)}>Galeria</a></li>
              <li><a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Preços</a></li>
              <li><a href="#booking" onClick={() => setMobileMenuOpen(false)}>Agendar</a></li>
              <li><a href="#about" onClick={() => setMobileMenuOpen(false)}>Sobre</a></li>
              <li>
                <button 
                  onClick={() => {
                    setShowConsultation(true);
                    setMobileMenuOpen(false);
                  }} 
                  className="consultation-btn"
                >
                  Consultar Agendamento
                </button>
              </li>
              {isAuthenticated ? (
                <li>
                  <button onClick={handleLogout} className="logout-btn">
                    Sair
                  </button>
                </li>
              ) : (
                <li>
                  <button onClick={() => {
                    setShowLogin(true);
                    setMobileMenuOpen(false);
                  }} className="admin-btn">
                    Admin
                  </button>
                </li>
              )}
            </ul>
            <div 
              className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-background-image">
          <div className="hero-overlay"></div>
          <div className="hero-gradient-overlay"></div>
        </div>
        <div className="hero-slider-indicators">
          <div className="indicator active"></div>
          <div className="indicator"></div>
          <div className="indicator"></div>
        </div>
        <div className="hero-decoration-elements">
          <div className="decoration-circle decoration-1"></div>
          <div className="decoration-circle decoration-2"></div>
          <div className="decoration-line"></div>
        </div>
        <div className="container hero-container">
          <div className="hero-content-wrapper">
            <div className="hero-badge-top">
              <span className="badge-icon">💅</span>
              <span>Especialista em Unhas</span>
            </div>
            <h1 className="hero-main-title">
              Raquel Pinheiro
            </h1>
            <div className="hero-title-divider"></div>
            <p className="hero-subtitle">
              Bióloga & Nail Artist Profissional
            </p>
            <p className="hero-description-text">
              Cada unha é uma <strong>obra de arte única</strong>. Com conhecimento científico, técnica refinada e atenção aos detalhes, transformo suas unhas em verdadeiras joias que refletem sua personalidade.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">+5</div>
                <div className="stat-label">Anos de Experiência</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Satisfação</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">📍</div>
                <div className="stat-label">Betim, MG</div>
              </div>
            </div>
            <div className="hero-cta-buttons">
              <a href="#booking" className="hero-btn hero-btn-primary">
                <span>Agendar Horário</span>
                <span className="btn-arrow">→</span>
              </a>
              <button 
                onClick={() => {
                  setShowConsultation(true);
                  setMobileMenuOpen(false);
                }} 
                className="hero-btn hero-btn-secondary"
              >
                <span>Consultar Agendamento</span>
                <span className="btn-icon">🔍</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Preview Cards */}
      <section className="services-preview">
        <div className="container">
          <div className="services-grid">
            <div className="service-card">
              <img 
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop" 
                alt="Manicure Artística"
              />
              <div className="service-card-overlay">
                <h3>Manicure Artística</h3>
              </div>
            </div>
            <div className="service-card">
              <img 
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop" 
                alt="Unhas de Gel"
              />
              <div className="service-card-overlay">
                <h3>Unhas de Gel</h3>
              </div>
            </div>
            <div className="service-card">
              <img 
                src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=300&fit=crop" 
                alt="Design Exclusivo"
              />
              <div className="service-card-overlay">
                <h3>Design Exclusivo</h3>
              </div>
            </div>
            <div className="service-card">
              <img 
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop" 
                alt="Cuidado Profissional"
              />
              <div className="service-card-overlay">
                <h3>Cuidado Profissional</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="section">
        <div className="container">
          <h2 className="section-title">Nossos Trabalhos</h2>
          <div className="gallery">
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop" alt="Unhas decoradas" />
              <div className="gallery-overlay">
                <h3>Unhas Artísticas</h3>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop" alt="Unhas francesinhas" />
              <div className="gallery-overlay">
                <h3>Francesinha Clássica</h3>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop" alt="Unhas coloridas" />
              <div className="gallery-overlay">
                <h3>Unhas Coloridas</h3>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop" alt="Unhas com glitter" />
              <div className="gallery-overlay">
                <h3>Unhas com Glitter</h3>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop" alt="Unhas geométricas" />
              <div className="gallery-overlay">
                <h3>Designs Geométricos</h3>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop" alt="Unhas naturais" />
              <div className="gallery-overlay">
                <h3>Unhas Naturais</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section">
        <div className="container">
          <h2 className="section-title">Nossos Preços</h2>
          <div className="pricing-table">
            <div className="pricing-grid">
              <div className="pricing-card">
                <h3>Manicure Básica</h3>
                <div className="price">R$ 25</div>
                <ul>
                  <li>Limpeza das unhas</li>
                  <li>Cutícula</li>
                  <li>Esmaltação</li>
                  <li>Secagem</li>
                </ul>
              </div>
              <div className="pricing-card featured">
                <h3>Manicure Completa</h3>
                <div className="price">R$ 45</div>
                <ul>
                  <li>Limpeza das unhas</li>
                  <li>Cutícula</li>
                  <li>Esmaltação</li>
                  <li>Francesinha</li>
                  <li>Hidratação</li>
                </ul>
              </div>
              <div className="pricing-card">
                <h3>Pedicure</h3>
                <div className="price">R$ 35</div>
                <ul>
                  <li>Limpeza dos pés</li>
                  <li>Cutícula</li>
                  <li>Esmaltação</li>
                  <li>Hidratação</li>
                </ul>
              </div>
              <div className="pricing-card">
                <h3>Unhas de Gel</h3>
                <div className="price">R$ 80</div>
                <ul>
                  <li>Alongamento</li>
                  <li>Gel</li>
                  <li>Design personalizado</li>
                  <li>Manutenção</li>
                </ul>
              </div>
              <div className="pricing-card">
                <h3>Unhas Artísticas</h3>
                <div className="price">R$ 60</div>
                <ul>
                  <li>Design exclusivo</li>
                  <li>Glitter</li>
                  <li>Pérolas</li>
                  <li>Decoração</li>
                </ul>
              </div>
              <div className="pricing-card">
                <h3>Pacote Completo</h3>
                <div className="price">R$ 120</div>
                <ul>
                  <li>Manicure + Pedicure</li>
                  <li>Unhas de Gel</li>
                  <li>Design artístico</li>
                  <li>Hidratação completa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="section booking">
        <div className="container">
          <h2 className="section-title">Agende Seu Horário</h2>
          <div className="booking-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  Nome Completo
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={bookingData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={touchedFields.name && validationErrors.name ? 'error' : touchedFields.name && !validationErrors.name ? 'valid' : ''}
                  required
                  placeholder="Digite seu nome completo"
                />
                {touchedFields.name && validationErrors.name && (
                  <span className="error-message">{validationErrors.name}</span>
                )}
                {touchedFields.name && !validationErrors.name && (
                  <span className="success-message">✓ Nome válido</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="phone">
                  Telefone
                  <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={touchedFields.phone && validationErrors.phone ? 'error' : touchedFields.phone && !validationErrors.phone ? 'valid' : ''}
                  required
                  placeholder="(31) 99999-9999"
                />
                {touchedFields.phone && validationErrors.phone && (
                  <span className="error-message">{validationErrors.phone}</span>
                )}
                {touchedFields.phone && !validationErrors.phone && (
                  <span className="success-message">✓ Telefone válido</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  E-mail
                  <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={touchedFields.email && validationErrors.email ? 'error' : touchedFields.email && !validationErrors.email ? 'valid' : ''}
                  required
                  placeholder="seuemail@exemplo.com"
                />
                {touchedFields.email && validationErrors.email && (
                  <span className="error-message">{validationErrors.email}</span>
                )}
                {touchedFields.email && !validationErrors.email && (
                  <span className="success-message">✓ E-mail válido</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="service">
                  Serviço
                  <span className="required">*</span>
                </label>
                <select
                  id="service"
                  name="service"
                  value={bookingData.service}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={touchedFields.service && validationErrors.service ? 'error' : touchedFields.service && !validationErrors.service ? 'valid' : ''}
                  required
                >
                  <option value="">Selecione um serviço</option>
                  <option value="manicure-basica">Manicure Básica - R$ 25</option>
                  <option value="manicure-completa">Manicure Completa - R$ 45</option>
                  <option value="pedicure">Pedicure - R$ 35</option>
                  <option value="unhas-gel">Unhas de Gel - R$ 80</option>
                  <option value="unhas-artisticas">Unhas Artísticas - R$ 60</option>
                  <option value="pacote-completo">Pacote Completo - R$ 120</option>
                </select>
                {touchedFields.service && validationErrors.service && (
                  <span className="error-message">{validationErrors.service}</span>
                )}
                {touchedFields.service && !validationErrors.service && (
                  <span className="success-message">✓ Serviço selecionado</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="date">
                  Data
                  <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={touchedFields.date && validationErrors.date ? 'error' : touchedFields.date && !validationErrors.date ? 'valid' : ''}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                {touchedFields.date && validationErrors.date && (
                  <span className="error-message">{validationErrors.date}</span>
                )}
                {touchedFields.date && !validationErrors.date && (
                  <span className="success-message">✓ Data válida</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="time">
                  Horário
                  <span className="required">*</span>
                </label>
                <select
                  id="time"
                  name="time"
                  value={bookingData.time}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={touchedFields.time && validationErrors.time ? 'error' : touchedFields.time && !validationErrors.time ? 'valid' : ''}
                  required
                  disabled={!bookingData.date}
                >
                  <option value="">Selecione um horário</option>
                  {bookingData.date && generateAvailableTimes(bookingData.date).map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {!bookingData.date && (
                  <small className="form-help">Selecione uma data primeiro</small>
                )}
                {bookingData.date && generateAvailableTimes(bookingData.date).length === 0 && (
                  <small className="form-help error">Nenhum horário disponível para esta data</small>
                )}
                {touchedFields.time && validationErrors.time && (
                  <span className="error-message">{validationErrors.time}</span>
                )}
                {touchedFields.time && !validationErrors.time && bookingData.time && (
                  <span className="success-message">✓ Horário selecionado</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="message">Observações (opcional)</label>
                <textarea
                  id="message"
                  name="message"
                  value={bookingData.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Conte-nos sobre suas preferências ou necessidades especiais..."
                />
              </div>
              <button type="submit" className="submit-btn">
                Agendar Horário
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about-section">
        <div className="container">
          <h2 className="section-title">Sobre Raquel</h2>
          <div className="about-content">
            <div className="about-text">
              <h3>Formação Profissional</h3>
              <p>Raquel Pinheiro é uma profissional única que combina sua formação em Biologia com sua paixão pela arte das unhas. Sua formação científica lhe proporciona um conhecimento profundo sobre a estrutura e saúde das unhas, garantindo tratamentos seguros e eficazes.</p>
              <p>Como bióloga, Raquel entende a importância do cuidado com a saúde das unhas, aplicando princípios científicos em cada procedimento para garantir não apenas a beleza, mas também a integridade das unhas de suas clientes.</p>
            </div>
            <div className="about-highlights">
              <div className="highlight-item">
                <div className="highlight-icon">🧬</div>
                <h4>Formação em Biologia</h4>
                <p>Conhecimento científico sobre estrutura e saúde das unhas</p>
              </div>
              <div className="highlight-item">
                <div className="highlight-icon">💅</div>
                <h4>Especialista em Unhas</h4>
                <p>Mais de 5 anos de experiência em nail art e cuidados</p>
              </div>
              <div className="highlight-item">
                <div className="highlight-icon">🏆</div>
                <h4>Qualidade Garantida</h4>
                <p>Combinação única de ciência e arte para resultados excepcionais</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="section info-section">
        <div className="container">
          <h2 className="section-title">Como as Unhas Valorizam a Mulher</h2>
          <div className="info-content">
            <div className="info-card">
              <div className="icon">💅</div>
              <h3>Autoestima</h3>
              <p>Unhas bem cuidadas aumentam a confiança e autoestima, fazendo você se sentir mais bonita e poderosa em qualquer situação.</p>
            </div>
            <div className="info-card">
              <div className="icon">✨</div>
              <h3>Elegância</h3>
              <p>Unhas decoradas são um acessório de moda que complementa seu visual, transmitindo elegância e sofisticação.</p>
            </div>
            <div className="info-card">
              <div className="icon">💖</div>
              <h3>Bem-estar</h3>
              <p>O cuidado com as unhas é um momento de relaxamento e autocuidado, essencial para o bem-estar mental e físico.</p>
            </div>
            <div className="info-card">
              <div className="icon">🌟</div>
              <h3>Personalidade</h3>
              <p>As unhas são uma forma de expressar sua personalidade e estilo único, criando uma identidade visual marcante.</p>
            </div>
            <div className="info-card">
              <div className="icon">👑</div>
              <h3>Profissionalismo</h3>
              <p>Unhas bem cuidadas transmitem profissionalismo e atenção aos detalhes, importantes em ambientes corporativos.</p>
            </div>
            <div className="info-card">
              <div className="icon">🎨</div>
              <h3>Criatividade</h3>
              <p>As unhas são uma tela em miniatura para expressar sua criatividade e arte, transformando-se em pequenas obras de arte.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Raquel Pinheiro</h3>
              <p>Bióloga e Especialista em unhas com mais de 5 anos de experiência, transformando suas unhas em verdadeiras obras de arte.</p>
            </div>
            <div className="footer-section">
              <h3>Contato</h3>
              <p>📱 (31) 99999-9999</p>
              <p>📧 raquel@email.com</p>
              <p>📍 Betim, Minas Gerais</p>
            </div>
            <div className="footer-section">
              <h3>Horários</h3>
              <p>Segunda a Sexta: 9h às 18h</p>
              <p>Sábado: 9h às 15h</p>
              <p>Domingo: Fechado</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Raquel Pinheiro - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/5531999999999?text=Olá!%20Gostaria%20de%20agendar%20um%20horário" 
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Fale conosco no WhatsApp"
      >
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M15 0C6.72 0 0 6.72 0 15c0 2.64.72 5.13 1.98 7.28L0 30l7.83-1.95A14.95 14.95 0 0015 30c8.28 0 15-6.72 15-15S23.28 0 15 0z" fill="#25D366"/>
          <path d="M11.57 9.09c-.3-.66-.61-1.03-1.02-1.16-.53-.18-1.14-.18-1.75-.18s-1.22.02-1.86.36c-.64.34-1.14.97-1.48 1.9-.52 1.42-.52 3.46-.52 5.14s0 3.72.52 5.14c.34.93.84 1.56 1.48 1.9.64.34 1.3.36 1.86.36s1.22-.02 1.75-.18c.41-.13.72-.5 1.02-1.16.3-.66.73-1.62 1.02-2.28.18-.4.18-.72 0-1.12-.18-.4-.73-1.12-1.02-1.52-.3-.4-.53-.67-.53-1.02s.23-.62.53-1.02c.3-.4.84-1.12 1.02-1.52z" fill="white"/>
          <path d="M15 6c-4.95 0-9 4.05-9 9 0 1.59.42 3.08 1.14 4.38L6 23l3.62-.86C10.92 23.58 12.91 24 15 24c4.95 0 9-4.05 9-9s-4.05-9-9-9zm4.41 12.59c-.22.62-1.14 1.14-1.56 1.18-.42.05-.73.04-1.06-.05-.33-.09-.73-.22-1.26-.44-2.22-.88-3.67-3.05-3.78-3.2-.11-.14-.89-1.14-.89-2.18s.56-1.54.73-1.72c.17-.18.37-.22.5-.22s.33 0 .47.06c.14.05.33.22.47.73.14.5.47 1.72.51 1.85.04.13.07.28 0 .44s-.09.33-.17.5c-.09.17-.19.33-.28.45-.09.11-.18.25-.08.49s.28.45.56.73c.39.39.82.75 1.17.96.48.29.88.38 1.07.48.18.09.28.07.39-.04.11-.11.45-.55.57-.73s.22-.28.37-.17.56.28 1.06.42c.5.15.89.25 1.01.39.12.14.12.83-.1 1.45z" fill="white"/>
        </svg>
      </a>

      {/* Modal de Login */}
      {showLogin && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Área Administrativa</h3>
              <button onClick={() => setShowLogin(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Usuário</label>
                <input
                  type="text"
                  id="username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  id="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Entrar</button>
            </form>
          </div>
        </div>
      )}

      {/* Painel Administrativo */}
      {showAdmin && (
        <div className="modal-overlay">
          <div className="admin-panel">
            <div className="admin-header">
              <h2>Painel Administrativo</h2>
              <button onClick={handleLogout} className="logout-btn">Sair</button>
            </div>
            
            <div className="admin-content">
              <div className="admin-section">
                <h3>Configuração de Horários</h3>
                <div className="schedule-config">
                  {Object.entries(scheduleConfig.workingDays).map(([day, config]) => (
                    <div key={day} className="day-config">
                      <div className="day-header">
                        <label className="day-label">
                          <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={(e) => {
                              const newConfig = {
                                ...scheduleConfig,
                                workingDays: {
                                  ...scheduleConfig.workingDays,
                                  [day]: { ...config, enabled: e.target.checked }
                                }
                              };
                              saveScheduleConfig(newConfig);
                            }}
                          />
                          {day === 'monday' && 'Segunda-feira'}
                          {day === 'tuesday' && 'Terça-feira'}
                          {day === 'wednesday' && 'Quarta-feira'}
                          {day === 'thursday' && 'Quinta-feira'}
                          {day === 'friday' && 'Sexta-feira'}
                          {day === 'saturday' && 'Sábado'}
                          {day === 'sunday' && 'Domingo'}
                        </label>
                      </div>
                      {config.enabled && (
                        <div className="time-config">
                          <div className="time-input">
                            <label>Início:</label>
                            <input
                              type="time"
                              value={config.startTime}
                              onChange={(e) => {
                                const newConfig = {
                                  ...scheduleConfig,
                                  workingDays: {
                                    ...scheduleConfig.workingDays,
                                    [day]: { ...config, startTime: e.target.value }
                                  }
                                };
                                saveScheduleConfig(newConfig);
                              }}
                            />
                          </div>
                          <div className="time-input">
                            <label>Fim:</label>
                            <input
                              type="time"
                              value={config.endTime}
                              onChange={(e) => {
                                const newConfig = {
                                  ...scheduleConfig,
                                  workingDays: {
                                    ...scheduleConfig.workingDays,
                                    [day]: { ...config, endTime: e.target.value }
                                  }
                                };
                                saveScheduleConfig(newConfig);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="slot-config">
                  <label>
                    Intervalo entre horários (minutos):
                    <input
                      type="number"
                      value={scheduleConfig.timeSlots}
                      onChange={(e) => {
                        const newConfig = {
                          ...scheduleConfig,
                          timeSlots: parseInt(e.target.value)
                        };
                        saveScheduleConfig(newConfig);
                      }}
                      min="15"
                      max="120"
                      step="15"
                    />
                  </label>
                </div>
              </div>

              <div className="admin-section">
                <h3>Agendamentos ({bookings.length})</h3>
                 <div className="bookings-list">
                   {bookings.map(booking => (
                     <div key={booking.id} className="booking-item enhanced">
                       <div className="booking-header">
                         <div className="booking-title">
                           <h4>{booking.name}</h4>
                           <span className={`status-badge status-${booking.status}`}>
                             {booking.status === 'pending' && '⏳ Pendente'}
                             {booking.status === 'confirmed' && '✅ Confirmado'}
                             {booking.status === 'cancelled' && '❌ Cancelado'}
                             {booking.status === 'completed' && '🎉 Concluído'}
                           </span>
                         </div>
                         <div className="booking-date">
                           {new Date(booking.date).toLocaleDateString('pt-BR')} às {booking.time}
                         </div>
                       </div>
                       
                       <div className="booking-details">
                         <div className="detail-row">
                           <div className="detail-item">
                             <strong>📞 Telefone:</strong>
                             <span>{booking.phone}</span>
                           </div>
                           <div className="detail-item">
                             <strong>📧 Email:</strong>
                             <span>{booking.email}</span>
                           </div>
                         </div>
                         
                         <div className="detail-row">
                           <div className="detail-item">
                             <strong>💅 Serviço:</strong>
                             <span>{booking.service}</span>
                           </div>
                           <div className="detail-item">
                             <strong>📅 Data de Criação:</strong>
                             <span>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</span>
                           </div>
                         </div>
                         
                         {booking.message && (
                           <div className="detail-row full-width">
                             <div className="detail-item">
                               <strong>💬 Observações:</strong>
                               <span className="message-text">{booking.message}</span>
                             </div>
                           </div>
                         )}
                       </div>
                       
                       <div className="booking-actions">
                         <div className="status-control">
                           <label>Status:</label>
                           <select
                             value={booking.status}
                             onChange={async (e) => {
                               try {
                                 await bookingService.updateBookingStatus(booking.id, e.target.value);
                                 const updatedBookings = bookings.map(b => 
                                   b.id === booking.id ? { ...b, status: e.target.value } : b
                                 );
                                 setBookings(updatedBookings);
                                 localStorage.setItem('bookings', JSON.stringify(updatedBookings));
                               } catch (error) {
                                 console.error('Erro ao atualizar status:', error);
                                 window.alert('Erro ao atualizar status do agendamento.');
                               }
                             }}
                             className="status-select"
                           >
                             <option value="pending">Pendente</option>
                             <option value="confirmed">Confirmado</option>
                             <option value="cancelled">Cancelado</option>
                             <option value="completed">Concluído</option>
                           </select>
                         </div>
                         
                         <button
                           onClick={async () => {
                             if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
                              try {
                                await bookingService.deleteBooking(booking.id);
                                const updatedBookings = bookings.filter(b => b.id !== booking.id);
                                setBookings(updatedBookings);
                                localStorage.setItem('bookings', JSON.stringify(updatedBookings));
                               } catch (error) {
                                 console.error('Erro ao excluir agendamento:', error);
                                 window.alert('Erro ao excluir agendamento.');
                               }
                             }
                           }}
                           className="delete-btn"
                         >
                           🗑️ Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="no-bookings">
                      <p>Nenhum agendamento encontrado.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Consulta de Agendamentos */}
      {showConsultation && (
        <div className="modal-overlay">
          <div className="modal consultation-modal">
            <div className="modal-header">
              <h2>Consultar Agendamento</h2>
              <button onClick={closeConsultation} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-content">
              <div className="consultation-form">
                <div className="form-group">
                  <label htmlFor="phone">Número de Telefone:</label>
                  <input
                    type="tel"
                    id="phone"
                    value={consultationPhone}
                    onChange={(e) => setConsultationPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="form-input"
                  />
                </div>
                
                <button 
                  onClick={handleConsultation}
                  disabled={consultationLoading}
                  className="btn btn-primary consultation-submit-btn"
                >
                  {consultationLoading ? 'Consultando...' : 'Consultar'}
                </button>
              </div>

              {/* Resultados da consulta */}
              {userBookings.length > 0 && (
                <div className="consultation-results">
                  <h3>Seus Agendamentos:</h3>
                  <div className="bookings-list">
                    {userBookings.map((booking, index) => (
                      <div key={booking.id || index} className="booking-card">
                        <div className="booking-info">
                          <h4>{booking.name}</h4>
                          <p><strong>Serviço:</strong> {booking.service}</p>
                          <p><strong>Data:</strong> {new Date(booking.date).toLocaleDateString('pt-BR')}</p>
                          <p><strong>Horário:</strong> {booking.time}</p>
                          <p><strong>Telefone:</strong> {booking.phone}</p>
                          {booking.message && (
                            <p><strong>Observações:</strong> {booking.message}</p>
                          )}
                        </div>
                        <div className="booking-status">
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status === 'pending' && '⏳ Pendente'}
                            {booking.status === 'confirmed' && '✅ Confirmado'}
                            {booking.status === 'cancelled' && '❌ Cancelado'}
                            {booking.status === 'completed' && '🎉 Concluído'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userBookings.length === 0 && consultationPhone && !consultationLoading && (
                <div className="no-bookings">
                  <p>Nenhum agendamento encontrado para este número de telefone.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
