import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Tabs from '@radix-ui/react-tabs';
import * as Separator from '@radix-ui/react-separator';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowLeft, User, Building2, Phone, KeyRound, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '../App';
import { authAPI } from '../../services/api';

// --- Icon Google (SVG custom) ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      style={{ fill: '#4285F4' }}
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      style={{ fill: '#34A853' }}
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
      style={{ fill: '#FBBC05' }}
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      style={{ fill: '#EA4335' }}
    />
  </svg>
);

// --- Props Definition ---
interface AuthPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onBack: () => void;
}

// Forgot password steps
type ForgotPasswordStep = 'email' | 'otp' | 'newPassword' | 'success';

export default function AuthPage({ onLoginSuccess, onBack }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  // Forms Hooks
  const { register: registerLogin, handleSubmit: handleLoginSubmit } = useForm();
  const { register: registerSignup, handleSubmit: handleSignupSubmit } = useForm();

  // Handle Login Logic - Tích hợp API thực tế + Demo mode
  const onLogin = async (data: any) => {
    setIsLoading(true);
    setError(null);

    // Demo login credentials (works without backend)
    const demoAccounts: Record<string, UserRole> = {
      'admin@demo.com': 'admin',
      'admin@careermate.vn': 'admin',
      'recruiter@demo.com': 'recruiter',
      'user@demo.com': 'user',
      'candidate@demo.com': 'user'
    };

    const emailLower = data.email.toLowerCase();

    // Demo check removed to enforce real backend authentication for AI features
    // if (demoAccounts[emailLower] && data.password === 'demo123') { ... }

    try {
      const result = await authAPI.login(data.email, data.password);

      if (result.access_token || result.token) {
        // Get user info to determine role
        const userInfo = await authAPI.getMe();
        let role: UserRole = 'user';

        if (userInfo.role === 'admin') {
          role = 'admin';
        } else if (userInfo.role === 'recruiter') {
          role = 'recruiter';
        }

        onLoginSuccess(role);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      // If API fails, suggest demo accounts
      setError('Server connection error. Try demo login: admin@demo.com / demo123');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup Logic - Tích hợp API thực tế
  const onSignup = async (data: any) => {
    setIsLoading(true);
    setError(null);

    // Validate password confirmation
    if (data.password !== data.password_confirm) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authAPI.register({
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        role: selectedRole === 'user' ? 'candidate' : selectedRole,
        full_name: data.name,
        phone: data.phone || ''
      });

      if (result.message?.includes('success') || result.user_id) {
        // Auto login after successful registration
        const loginResult = await authAPI.login(data.email, data.password);
        if (loginResult.access_token || loginResult.token) {
          onLoginSuccess(selectedRole);
        } else {
          setError('Registration successful! Please login.');
        }
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Server connection error. Please try again later.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handlers
  const handleSendOTP = async () => {
    if (!forgotEmail) {
      setError('Please enter your email.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authAPI.sendPasswordResetOTP(forgotEmail);

      if (result.error) {
        setError(result.error);
      } else {
        setForgotPasswordMessage(result.message || `Verification code sent to ${forgotEmail}`);
        setForgotPasswordStep('otp');
      }
    } catch (err) {
      setError('Unable to send verification code. Please try again.');
      console.error('Send OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter a 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authAPI.verifyOTP(forgotEmail, otpCode);

      if (result.valid) {
        setForgotPasswordStep('newPassword');
        setForgotPasswordMessage('');
      } else {
        setError(result.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setError('Invalid OTP code. Please try again.');
      console.error('Verify OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must have at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Confirm password does not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authAPI.resetPassword(forgotEmail, otpCode, newPassword);

      if (result.error) {
        setError(result.error);
      } else {
        setForgotPasswordStep('success');
      }
    } catch (err) {
      setError('Unable to reset password. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setForgotEmail('');
    setOtpCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError(null);
    setForgotPasswordMessage('');
  };

  const roleOptions = [
    { value: 'user' as UserRole, label: 'Candidate', icon: User, description: 'Find suitable jobs' },
    { value: 'recruiter' as UserRole, label: 'Recruiter', icon: Building2, description: 'Post jobs and hire' },
  ];

  // Forgot Password UI
  if (showForgotPassword) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 relative">
        {/* Nút Quay lại */}
        <button
          onClick={resetForgotPassword}
          className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
          {/* Step 1: Enter Email */}
          {forgotPasswordStep === 'email' && (
            <>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Forgot Password?</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your email and we'll send you a verification code to reset your password.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center cursor-pointer transition-all"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Verification Code"}
                </button>
              </div>
            </>
          )}

          {/* Step 2: Enter OTP */}
          {forgotPasswordStep === 'otp' && (
            <>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <KeyRound className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Enter Verification Code</h2>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a 6-digit code to <span className="font-medium text-gray-900">{forgotEmail}</span>
                </p>
              </div>

              {forgotPasswordMessage && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                  {forgotPasswordMessage}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">OTP Code</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-3 px-4 text-center text-2xl font-mono tracking-[0.5em] placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center cursor-pointer transition-all"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify"}
                </button>

                <button
                  onClick={() => {
                    setForgotPasswordStep('email');
                    setError(null);
                  }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  Did not receive code? <span className="text-blue-600 font-medium">Resend</span>
                </button>
              </div>
            </>
          )}

          {/* Step 3: New Password */}
          {forgotPasswordStep === 'newPassword' && (
            <>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Reset Password</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Create a new password for your account
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Password requirements */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p className={newPassword.length >= 6 ? 'text-green-600' : ''}>
                    • At least 6 characters {newPassword.length >= 6 && '✓'}
                  </p>
                  <p className={newPassword === confirmNewPassword && confirmNewPassword ? 'text-green-600' : ''}>
                    • Passwords match {newPassword === confirmNewPassword && confirmNewPassword && '✓'}
                  </p>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center cursor-pointer transition-all"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
                </button>
              </div>
            </>
          )}

          {/* Step 4: Success */}
          {forgotPasswordStep === 'success' && (
            <>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Success!</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Your password has been successfully reset. You can now login with your new password.
                </p>
              </div>

              <button
                onClick={resetForgotPassword}
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 flex items-center justify-center cursor-pointer transition-all"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 relative">
      {/* Nút Quay lại */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage your CV and career
          </p>
        </div>

        {/* Tab Switcher */}
        <Tabs.Root defaultValue="login" className="w-full">
          <Tabs.List className="grid w-full grid-cols-2 rounded-xl bg-gray-100 p-1 mb-6">
            <Tabs.Trigger
              value="login"
              className="rounded-lg py-2.5 text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer hover:text-gray-700"
            >
              Login
            </Tabs.Trigger>
            <Tabs.Trigger
              value="signup"
              className="rounded-lg py-2.5 text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer hover:text-gray-700"
            >
              Sign Up
            </Tabs.Trigger>
          </Tabs.List>

          {/* === LOGIN FORM === */}
          <Tabs.Content value="login" className="space-y-4 outline-none focus:outline-none">
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...registerLogin('email', { required: true })}
                    type="email"
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...registerLogin('password', { required: true })}
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-black py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center cursor-pointer transition-all"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
              </button>
            </form>
          </Tabs.Content>

          {/* === SIGNUP FORM === */}
          <Tabs.Content value="signup" className="space-y-4 outline-none focus:outline-none">
            <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">You are</label>
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.value;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className={`p-2 rounded-lg inline-flex mb-2 ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {role.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...registerSignup('name', { required: true })}
                    type="text"
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...registerSignup('email', { required: true })}
                    type="email"
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...registerSignup('phone')}
                    type="tel"
                    placeholder="+1 234 567 890"
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...registerSignup('password', { required: true })}
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...registerSignup('password_confirm', { required: true })}
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-black py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center cursor-pointer transition-all"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
              </button>
            </form>
          </Tabs.Content>
        </Tabs.Root>

        {/* Separator & Social */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator.Root className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <button
            type="button"
            onClick={() => {
              // Determine role for OAuth: 'recruiter' or 'candidate' (default)
              const oauthRole = selectedRole === 'recruiter' ? 'recruiter' : 'candidate';
              window.location.href = `http://localhost:9999/api/auth/google?role=${oauthRole}`;
            }}
            className="flex w-full max-w-xs items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to our <a href="#" className="underline hover:text-gray-900">Terms of Service</a> and <a href="#" className="underline hover:text-gray-900">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
