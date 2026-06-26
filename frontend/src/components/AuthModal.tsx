import React, { useState } from 'react';
import { X, Mail, Phone, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginUser, registerUser } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isRegister) {
      // Basic validations
      if (!name || !email || !phone || !password) {
        setErrorMsg('All fields are required!');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (phone.length < 10) {
        setErrorMsg('Please enter a valid phone number.');
        return;
      }

      const res = await registerUser({ name, email, phone, password });
      if (res.success) {
        setSuccessMsg('Registration successful! Logging you in...');
        const loginRes = await loginUser(email, password);
        if (loginRes.success) {
          setSuccessMsg('Logged in successfully!');
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1200);
        } else {
          setErrorMsg(loginRes.message);
        }
      } else {
        setErrorMsg(res.message);
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Please enter email and password.');
        return;
      }
      
      const res = await loginUser(email, password);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    setShowPassword(false);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrorMsg('');
    setSuccessMsg('');
    setShowPassword(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>
          {isRegister ? 'Create Account' : 'Sign In'}
        </h2>

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(255, 59, 48, 0.15)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(52, 199, 89, 0.15)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                  <UserIcon size={16} />
                </span>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe"
                  style={{ paddingLeft: '40px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <Mail size={16} />
              </span>
              <input 
                type="email" 
                className="form-input" 
                placeholder="student@hostel.com"
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                  <Phone size={16} />
                </span>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="e.g. 9876543210"
                  style={{ paddingLeft: '40px' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <Lock size={16} />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-input" 
                placeholder="••••••••"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-brand" 
            style={{ width: '100%', height: '44px', fontSize: '15px' }}
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {isRegister ? 'Already have an account? ' : 'New to MealTube? '}
          <button 
            onClick={toggleMode} 
            style={{ color: 'var(--brand-color)', fontWeight: 600, textDecoration: 'underline' }}
          >
            {isRegister ? 'Sign In' : 'Register Now'}
          </button>
        </div>

      </div>
    </div>
  );
};
