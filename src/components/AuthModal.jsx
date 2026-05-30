import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Shield, Check, RefreshCw } from 'lucide-react';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [useMobileLogin, setUseMobileLogin] = useState(false);
  
  // Registration and Login form fields
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or mobile

  // Loading & Step management
  const [loading, setLoading] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [otpType, setOtpType] = useState('register'); // 'register' or 'login'
  const [otpSessionData, setOtpSessionData] = useState(null);
  const [otpToast, setOtpToast] = useState('');

  // Password strength check criteria
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200', width: 'w-0' };
    const criteria = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    };
    const score = Object.values(criteria).filter(Boolean).length;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500', width: 'w-2/3' };
    return { score, label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  // Countdown timer for simulated OTP
  useEffect(() => {
    let timer;
    if (showOtpStep && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpStep, otpCountdown]);

  // Copy simulated code to clipboard and clear toast
  const handleCopyToast = () => {
    navigator.clipboard.writeText(otpToast);
    alert('Simulated verification code copied to clipboard!');
    setOtpToast('');
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setShowOtpStep(false);
    setOtpToast('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    
    if (isLogin) {
      // Login flow
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: loginIdentifier, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }
        
        if (data.otp_required) {
          setOtpSessionData({ username: loginIdentifier });
          setOtpType('login');
          setOtpCountdown(60);
          setShowOtpStep(true);
          setOtpToast(data.code);
        } else {
          localStorage.setItem('resumeoptimizer_user', JSON.stringify(data.user));
          localStorage.setItem('resumeoptimizer_token', data.access_token);
          onLoginSuccess(data.user);
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Register validation & OTP request flow
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, mobile, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }
        
        if (data.otp_required) {
          setOtpSessionData({ name, email, mobile, password });
          setOtpType('register');
          setOtpCountdown(60);
          setShowOtpStep(true);
          setOtpToast(data.code);
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      alert('Please enter a 6-digit OTP code');
      return;
    }
    
    setLoading(true);
    
    try {
      if (otpType === 'register') {
        const response = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: otpSessionData.name,
            email: otpSessionData.email,
            mobile: otpSessionData.mobile,
            password: otpSessionData.password,
            code: otpCode
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'OTP verification failed');
        }
        
        localStorage.setItem('resumeoptimizer_user', JSON.stringify(data.user));
        localStorage.setItem('resumeoptimizer_token', data.access_token);
        onLoginSuccess(data.user);
        setOtpToast('');
      } else {
        // Login OTP verification
        const response = await fetch('/api/verify-login-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: otpSessionData.username,
            code: otpCode
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'OTP verification failed');
        }
        
        localStorage.setItem('resumeoptimizer_user', JSON.stringify(data.user));
        localStorage.setItem('resumeoptimizer_token', data.access_token);
        onLoginSuccess(data.user);
        setOtpToast('');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    const identifier = otpType === 'register' 
      ? { email: otpSessionData.email, mobile: otpSessionData.mobile } 
      : { email: otpSessionData.username, mobile: otpSessionData.username };
      
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(identifier)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }
      
      setOtpCountdown(60);
      setOtpCode('');
      setOtpToast(data.code);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-slide-down">
        
        {/* Simulated OTP Notification Toast inside Modal header */}
        {otpToast && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-bounce border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Simulated Notification</p>
                <p className="text-sm font-mono font-black text-emerald-400">OTP Code: {otpToast}</p>
              </div>
            </div>
            <button 
              onClick={handleCopyToast} 
              className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Copy Code
            </button>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>

          {!showOtpStep ? (
            <>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-500 mb-6 text-sm">
                {isLogin 
                  ? 'Access your resume dashboards and optimize documents.' 
                  : 'Start tracking job descriptions and build tailored resumes.'}
              </p>

              {/* Login mode selector (Email vs Mobile) */}
              {isLogin && (
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setUseMobileLogin(false);
                      setLoginIdentifier('');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!useMobileLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Email Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseMobileLogin(true);
                      setLoginIdentifier('');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${useMobileLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Mobile Login
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    {/* Email for Registration */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    {/* Mobile Number for Registration */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={mobile}
                          onChange={e => setMobile(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                  </>
                )}

                {isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      {useMobileLogin ? 'Mobile Number' : 'Email Address'}
                    </label>
                    <div className="relative">
                      {useMobileLogin ? (
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      ) : (
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      )}
                      <input
                        type={useMobileLogin ? 'tel' : 'email'}
                        required
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                        placeholder={useMobileLogin ? '+1234567890' : 'you@example.com'}
                      />
                    </div>
                  </div>
                )}

                {/* Password field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Password Strength Progress Bar (only on Registration) */}
                  {!isLogin && password && (
                    <div className="mt-2.5 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-500">Password Strength:</span>
                        <span className={`font-black ${
                          strength.label === 'Weak' ? 'text-red-500' :
                          strength.label === 'Medium' ? 'text-amber-500' :
                          'text-emerald-500'
                        }`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 text-[10px] text-slate-400 font-bold">
                        <div className="flex items-center gap-1">
                          <span className={password.length >= 8 ? "text-emerald-500 font-extrabold" : "text-slate-300"}>✓</span>
                          <span>Min 8 chars</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={/[A-Z]/.test(password) ? "text-emerald-500 font-extrabold" : "text-slate-300"}>✓</span>
                          <span>1 Uppercase</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={/[a-z]/.test(password) ? "text-emerald-500 font-extrabold" : "text-slate-300"}>✓</span>
                          <span>1 Lowercase</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={/[0-9]/.test(password) ? "text-emerald-500 font-extrabold" : "text-slate-300"}>✓</span>
                          <span>1 Number</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          <span className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-500 font-extrabold" : "text-slate-300"}>✓</span>
                          <span>1 Special Char</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password field (only on Registration) */}
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                        placeholder="••••••••"
                      />
                    </div>

                    {confirmPassword && (
                      <div className="mt-2 flex items-center gap-1 text-xs">
                        {password === confirmPassword ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-4 h-4 text-emerald-500" /> Passwords Match
                          </span>
                        ) : (
                          <span className="text-red-500 font-bold">
                            ✗ Passwords do not match
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (!isLogin && password !== confirmPassword)}
                  className="w-full py-3.5 mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:-translate-y-0.5 shadow-lg shadow-blue-500/25 active:translate-y-0 transition-all disabled:opacity-50 flex justify-center items-center gap-2 text-sm cursor-pointer"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    isLogin ? 'Verify Credentials' : 'Request Verification OTP'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors uppercase tracking-wider"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                </button>
              </div>
            </>
          ) : (
            // Simulated OTP Input Step
            <>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Verify OTP Code
              </h2>
              <p className="text-slate-500 mb-6 text-sm">
                We&apos;ve sent a simulated 6-digit OTP code to{' '}
                <span className="font-bold text-slate-800">
                  {otpType === 'register' 
                    ? (otpSessionData?.mobile || otpSessionData?.email) 
                    : otpSessionData?.username}
                </span>.
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 text-center">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center py-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-mono tracking-[0.75em] pl-[0.375em] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800"
                    placeholder="000000"
                  />
                </div>

                <div className="flex flex-col items-center gap-3">
                  {otpCountdown > 0 ? (
                    <span className="text-xs text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      Resend code in <span className="font-black text-slate-700">{otpCountdown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-500 font-black uppercase tracking-wider disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Resend OTP Code
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpStep(false);
                      setOtpToast('');
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Back to Edit Info
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:-translate-y-0.5 shadow-lg shadow-blue-500/25 active:translate-y-0 transition-all disabled:opacity-50 flex justify-center items-center gap-2 text-sm cursor-pointer"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Verify & Log In'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
