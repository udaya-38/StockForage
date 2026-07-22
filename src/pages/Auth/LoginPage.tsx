import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Boxes, ArrowRight, Lock, Mail, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui';
import { APP_NAME, APP_TAGLINE, DEMO_USERS } from '../../constants';
import { cn } from '../../utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { isAuthenticated, login } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data: LoginForm) => {
    setAuthError('');
    await new Promise(r => setTimeout(r, 400)); // Simulate network delay
    const result = login(data.email, data.password, data.remember ?? false);
    if (!result.success) setAuthError(result.error ?? 'Login failed.');
  };

  const fillDemo = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    setAuthError('');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-info-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-dark-900/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-glass-lg overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="h-0.5 bg-gradient-to-r from-brand-500 via-info-500 to-purple-500" />

          <div className="p-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-info-500 flex items-center justify-center shadow-glow">
                <Boxes size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white font-display tracking-tight">{APP_NAME}</h1>
                <p className="text-xs text-dark-400">{APP_TAGLINE}</p>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-white font-display">Welcome back</h2>
              <p className="text-sm text-dark-400 mt-1">Sign in to your account to continue</p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    className={cn(
                      'w-full h-10 pl-9 pr-3 rounded-xl text-sm transition-all duration-150',
                      'bg-dark-800 border border-dark-700 text-white placeholder:text-dark-500',
                      'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
                      errors.email && 'border-danger-500 focus:ring-danger-500'
                    )}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-danger-400">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={cn(
                      'w-full h-10 pl-9 pr-10 rounded-xl text-sm transition-all duration-150',
                      'bg-dark-800 border border-dark-700 text-white placeholder:text-dark-500',
                      'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
                      errors.password && 'border-danger-500 focus:ring-danger-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-danger-400">{errors.password.message}</p>}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-dark-400 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('remember')}
                    className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-brand-600 focus:ring-brand-500"
                  />
                  Remember me
                </label>
                <button type="button" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Auth Error */}
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm"
                >
                  {authError}
                </motion.div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full mt-2"
                iconRight={!isSubmitting ? <ArrowRight size={16} /> : undefined}
              >
                Sign in
              </Button>
            </motion.form>
          </div>

          {/* Demo credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border-t border-dark-800 px-8 py-5"
          >
            <p className="flex items-center gap-1.5 text-xs font-medium text-dark-400 mb-3">
              <Zap size={12} className="text-brand-500" />
              Demo accounts — click to fill
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => fillDemo(user.email, user.password)}
                  className="p-2 rounded-xl bg-dark-800/60 border border-dark-700 hover:border-brand-500/40 hover:bg-dark-700 transition-all duration-150 text-center group"
                >
                  <span className="block text-[11px] font-semibold text-dark-300 group-hover:text-white capitalize">{user.role}</span>
                  <span className="block text-[10px] text-dark-500 group-hover:text-dark-400 truncate mt-0.5">{user.email.split('@')[0]}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-dark-600 mt-4"
        >
          InventoryFlow — Built for modern businesses
        </motion.p>
      </div>
    </div>
  );
}
