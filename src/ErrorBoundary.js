import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Erro foi capturado, mas não vamos mostrar ao usuário
    // Apenas manter o site funcionando
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      // Em caso de erro, tentar renderizar normalmente
      return this.props.children;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

