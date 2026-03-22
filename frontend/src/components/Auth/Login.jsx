import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bem-vindo de volta!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Falha ao entrar. Verifique suas credenciais.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">⚡</span>
            <span className="auth-logo-text">TaskFlow</span>
          </div>
          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-subtitle">Entre para continuar sua jornada produtiva</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="loading-spinner-sm" />
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </motion.button>
        </form>

        <p className="auth-footer">
          Não tem conta?{' '}
          <Link to="/register" className="auth-link">
            Criar conta grátis
          </Link>
        </p>
      </motion.div>

      <div className="auth-bg-effects">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>
    </div>
  );
};

export default Login;
