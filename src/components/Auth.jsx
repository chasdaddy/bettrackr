import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { containerStyle, glassCardStyle, inputStyle, COLORS } from '../lib/styles';

export default function Auth() {
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) setAuthError(error.message);
      else setAuthError('Check your email to confirm signup!');
    }
  };

  const tabBtn = (mode) => ({
    flex: 1,
    padding: '12px',
    background: authMode === mode ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
    border: 'none',
    borderBottom: authMode === mode ? `2px solid ${COLORS.green}` : '2px solid transparent',
    color: authMode === mode ? COLORS.green : COLORS.textDimmer,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    boxShadow: authMode === mode ? '0 2px 10px rgba(0, 255, 136, 0.15)' : 'none',
  });

  return (
    <div style={containerStyle} className="animate-fadeIn">
      <div style={{
        ...glassCardStyle,
        maxWidth: '400px',
        margin: '80px auto',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 255, 136, 0.05)',
      }} className="animate-float">
        <h1 style={{
          margin: '0 0 10px 0',
          fontSize: '2rem',
          background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '3px',
          textAlign: 'center',
          filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.3))',
        }}>
          BETTRACKR
        </h1>
        <p style={{ color: COLORS.textDimmer, textAlign: 'center', marginBottom: '30px', fontSize: '0.8rem' }}>
          Track your edge. Beat the books.
        </p>

        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <button onClick={() => setAuthMode('login')} style={tabBtn('login')}>LOGIN</button>
          <button onClick={() => setAuthMode('signup')} style={tabBtn('signup')}>SIGN UP</button>
        </div>

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={authEmail}
            onChange={e => setAuthEmail(e.target.value)}
            style={{ ...inputStyle, width: '100%', marginBottom: '15px', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={authPassword}
            onChange={e => setAuthPassword(e.target.value)}
            style={{ ...inputStyle, width: '100%', marginBottom: '20px', boxSizing: 'border-box' }}
          />
          {authError && (
            <div style={{
              color: authError.includes('Check') ? COLORS.green : COLORS.red,
              marginBottom: '15px',
              fontSize: '0.85rem',
              animation: 'fadeIn 0.3s ease',
            }}>
              {authError}
            </div>
          )}
          <button type="submit" style={{
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            border: 'none',
            borderRadius: '6px',
            color: '#000',
            fontFamily: 'inherit',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)',
            transition: 'all 0.3s ease',
          }}>
            {authMode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
}
