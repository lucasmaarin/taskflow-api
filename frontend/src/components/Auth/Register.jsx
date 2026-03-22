import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirm) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirm) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Conta criada! Bem-vindo ao TaskFlow 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Falha ao criar conta';
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
          <h1 className="auth-title">Criar conta grátis</h1>
          <p className="auth-subtitle">Comece sua jornada produtiva hoje</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">
              Confirmar senha
            </label>
            <input
              id="confirm"
              type="password"
              className="form-input"
              placeholder="Repita a senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
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
                Criando conta...
              </span>
            ) : (
              'Criar conta'
            )}
          </motion.button>
        </form>

        <p className="auth-footer">
          Já tem conta?{' '}
          <Link to="/login" className="auth-link">
            Entrar
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

export default Register;
