import React, { useState } from 'react';
import {
  IonPage, IonContent, IonInput, IonButton, IonText,
  IonSpinner, IonIcon
} from '@ionic/react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      // AuthContext + AppRoutes will redirect automatically based on role
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
  const roleColor: Record<string, string> = {
    buyer: '#4CAF50',
    seller: '#FF9800',
    admin: '#F44336',
  };
  const color = roleColor[role ?? ''] ?? '#2E7D32';

  return (
    <IonPage>
      <IonContent className="bg-secondary">
        <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: `${color}20` }}
            >
              <span className="text-3xl font-extrabold" style={{ color }}>A</span>
            </div>
            <h1 className="text-3xl font-bold text-primary">AAUAMart</h1>
            <p className="text-gray-500 mt-1">Sign in as <strong>{roleLabel}</strong></p>
          </div>

          {/* Card */}
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <IonInput
                type="email"
                value={email}
                placeholder="you@example.com"
                onIonInput={e => setEmail(e.detail.value ?? '')}
                className="rounded-xl border border-gray-200 px-3"
                style={{ '--padding-start': '12px', '--padding-end': '12px' }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <IonInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  placeholder="••••••••"
                  onIonInput={e => setPassword(e.detail.value ?? '')}
                  className="rounded-xl border border-gray-200 px-3"
                  style={{ '--padding-start': '12px', '--padding-end': '48px' }}
                  onKeyUp={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: '20px' }} />
                </button>
              </div>
            </div>

            <IonButton
              expand="block"
              onClick={handleLogin}
              disabled={loading}
              style={{
                '--background': color,
                '--border-radius': '12px',
                '--padding-top': '14px',
                '--padding-bottom': '14px',
              }}
            >
              {loading ? <IonSpinner name="crescent" color="light" /> : 'Sign In'}
            </IonButton>

            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account?{' '}
              <Link to={`/signup/${role}`} className="font-semibold" style={{ color }}>
                Sign Up
              </Link>
            </p>
          </div>

          <button
            onClick={() => navigate('/role-selection')}
            className="mt-6 text-sm text-gray-400 underline"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Back to role selection
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
