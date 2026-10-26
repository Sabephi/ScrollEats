import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne. Sprawdź wpisane dane.');
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? '/api/token/' : '/api/users/register/';

    const payload = isLogin
      ? { username: formData.email, password: formData.password }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Błąd odpowiedzi serwera (${response.status} ${response.statusText})`);
      }

      if (!response.ok) {

        let errorMsg = '';

        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (typeof data === 'object' && data !== null) {
          const entries = Object.entries(data);
          if (entries.length > 0) {
            const [field, messages] = entries[0];
            const msgText = Array.isArray(messages) ? messages.join(', ') : messages;
            errorMsg = `${field.toUpperCase()}: ${msgText}`;
          }
        }

        throw new Error(errorMsg || `Błąd HTTP ${response.status}`);
      }

      if (isLogin && data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        navigate('/profile');
      } else if (!isLogin) {
        setIsLogin(true);
        setSuccessMsg('Konto zostało utworzone pomyślnie! Zaloguj się.');
      }
    } catch (err: any) {
      setError(err.message || 'Coś poszło nie tak.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-hero-side">
          <div className="auth-hero-overlay"></div>
          <img
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80"
            alt="Culinary art"
            className="auth-hero-bg"
          />
          <div className="auth-hero-content">
            <div className="hero-tag">
              <span className="green-dot"></span> SCROLLEATS EXPERIENCE
            </div>
            <h1 className="hero-title">
              Elevate your <br />
              <span className="green-text">culinary</span> journey.
            </h1>
            <p className="hero-description">
              Join the most exclusive community of digital gastronomes. Discover
              curated flavors, high-end editorial recipes, and sensory-driven
              dining experiences.
            </p>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-brand-logo">SCROLLEATS</div>

          <div className="auth-form-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>
              {isLogin
                ? 'Enter your credentials to access your library.'
                : 'Join ScrollEats to save and share your favorite recipes.'}
            </p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}
          {successMsg && <div className="auth-success-banner">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="auth-input-group">
                <label>USERNAME</label>
                <input
                  type="text"
                  name="username"
                  placeholder="e.g. chefmario"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="auth-input-group">
              <label>{isLogin ? 'USERNAME' : 'EMAIL ADDRESS'}</label>
              <input
                type={isLogin ? 'text' : 'email'}
                name="email"
                placeholder={isLogin ? 'chefmario' : 'chef@scrolleats.com'}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-input-group">
              <div className="label-row">
                <label>PASSWORD</label>
                {isLogin && (
                  <button type="button" className="forgot-btn">
                    FORGOT?
                  </button>
                )}
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="auth-input-group">
                <label>CONFIRM PASSWORD</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="social-auth-grid">
            <button type="button" className="btn-social">
              GOOGLE
            </button>
            <button type="button" className="btn-social">
              APPLE
            </button>
          </div>

          <div className="auth-toggle-footer">
            {isLogin ? (
              <p>
                New to ScrollEats?{' '}
                <button type="button" onClick={() => setIsLogin(false)}>
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button type="button" onClick={() => setIsLogin(true)}>
                  Sign in
                </button>
              </p>
            )}
          </div>

          <div className="auth-footer-copyright">
            © 2026 SCROLLEATS STUDIO
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;