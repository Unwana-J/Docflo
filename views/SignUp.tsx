import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Github, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface SignUpProps {
  onComplete: (isPending: boolean, firstName: string, lastName: string, email: string) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onComplete }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('inviteToken');
    if (token) setInviteToken(token);
  }, []);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isValid = firstName.trim() && lastName.trim() && email.trim() && password.length >= 8 && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onComplete(!!inviteToken, firstName, lastName, email);
  };

  const PasswordStrength = () => {
    const strength = password.length === 0 ? 0
      : password.length < 6 ? 1
      : password.length < 10 ? 2
      : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
    const colors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    if (!password) return null;
    return (
      <div className="mt-2 flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : 'bg-slate-200'}`} />
          ))}
        </div>
        <span className={`text-xs font-bold ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-orange-500' : strength === 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
          {labels[strength]}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl">
          <span className="text-white font-black text-2xl tracking-tighter">DF</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {inviteToken ? 'Join Your Team on DocuFlow' : 'Create your account'}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {inviteToken ? 'An invite token was detected. You will be added as a collaborator.' : 'Already have an account? Sign in'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl shadow-slate-200/50 sm:rounded-[2rem] sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="appearance-none block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="Alex"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="appearance-none block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="Johnson"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-9 pr-10 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`appearance-none block w-full pl-9 pr-10 py-3 border rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${
                    passwordMismatch
                      ? 'border-red-300 focus:ring-red-400'
                      : 'border-slate-200 focus:ring-blue-500'
                  }`}
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordMismatch && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
                </svg>
              </button>
              <button className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">
                <Github className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
