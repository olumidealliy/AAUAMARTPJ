import React, { useState } from 'react';
import {
  IonPage, IonContent, IonInput, IonButton,
  IonSpinner, IonIcon
} from '@ionic/react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const Signup: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof typeof form) => (e: any) =>
    setForm(f => ({ ...f, [field]: e.detail.value ?? '' }));

  const handleSignup = async () => {
    const { firstName, lastName, phone, email, password, confirmPassword } = form;
    if (!firstName || !lastName || !phone || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, {
        firstName,
        lastName,
        phone,
        email,
        role: (role as UserRole) ?? 'buyer',
      });
      // AuthContext will pick up the new user and redirect via AppRoutes
    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak.');
          break;
        default:
          setError('Sign up failed. Please try again.');
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

  const fields: Array<{ label: string; field: keyof typeof form; type?: string; placeholder: string }> = [
    { label: 'First Name',  field: 'firstName',       placeholder: 'Ada'            },
    { label: 'Last Name',   field: 'lastName',        placeholder: 'Okafor'         },
    { label: 'Phone',       field: 'phone', type: 'tel', placeholder: '08012345678' },
    { label: 'Email',       field: 'email', type: 'email', placeholder: 'you@example.com' },
    { label: 'Password',    field: 'password',        placeholder: '••••••••'       },
    { label: 'Confirm Password', field: 'confirmPassword', placeholder: '••••••••' },
  ];

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
            <p className="text-gray-500 mt-1">Create a <strong>{roleLabel}</strong> account</p>
          </div>

          {/* Card */}
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            {fields.map(({ label, field, type, placeholder }) => {
              const isPasswordField = field === 'password' || field === 'confirmPassword';
              const inputType = isPasswordField
                ? (showPassword ? 'text' : 'password')
                : (type ?? 'text');
              return (
                <div className="mb-4" key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <IonInput
                      type={inputType as any}
                      value={form[field]}
                      placeholder={placeholder}
                      onIonInput={update(field)}
                      className="rounded-xl border border-gray-200"
                      style={{ '--padding-start': '12px', '--padding-end': isPasswordField ? '48px' : '12px' }}
                    />
                    {isPasswordField && field === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: '20px' }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <IonButton
              expand="block"
              onClick={handleSignup}
              disabled={loading}
              className="mt-2"
              style={{
                '--background': color,
                '--border-radius': '12px',
                '--padding-top': '14px',
                '--padding-bottom': '14px',
              }}
            >
              {loading ? <IonSpinner name="crescent" color="light" /> : 'Create Account'}
            </IonButton>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <Link to={`/login/${role}`} className="font-semibold" style={{ color }}>
                Sign In
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

export default Signup;
