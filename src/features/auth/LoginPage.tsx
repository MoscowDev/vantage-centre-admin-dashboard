import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useAuth } from './useAuth';
import { useToast } from '../../components/ui/Toast';

// Form validation schema with Zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(6, 'Security credentials must contain at least 6 characters'),
});

type LoginInputs = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Router return paths
  const from = location.state?.from?.pathname || '/leads';
  const wasSessionExpired = searchParams.get('expired') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInputs) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      showToast('Logged in successfully', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      showToast('Invalid operator email or password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (wasSessionExpired) {
      showToast('Session expired. Please log in again.', 'warning');
    }
  }, [wasSessionExpired]);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-canvas overflow-x-hidden">
      <div className="hidden lg:flex w-1/2 bg-ink relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 100,200 Q 250,120 400,220 T 700,150" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="6,8" />
            <path d="M 150,450 Q 350,300 500,420 T 750,300" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="4,6" />
            <path d="M 200,600 Q 400,500 600,550" fill="none" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="6,8" />
            <circle cx="100" cy="200" r="5" fill="var(--color-accent)" className="animate-pulse" />
            <circle cx="400" cy="220" r="4" fill="var(--color-accent-ink)" />
            <circle cx="700" cy="150" r="6" fill="var(--color-success)" />
            <circle cx="150" cy="450" r="4" fill="var(--color-accent-ink)" />
            <circle cx="500" cy="420" r="5" fill="var(--color-accent)" />
            <circle cx="750" cy="300" r="6" fill="var(--color-success)" />
            <circle cx="200" cy="600" r="5" fill="var(--color-accent)" />
            <circle cx="600" cy="550" r="5" fill="var(--color-success)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-[8px] bg-accent flex items-center justify-center">
            <GraduationCap className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">Vantage Center</h2>
            <span className="text-[8px] text-muted uppercase tracking-widest leading-none block mt-0.5">
              Portal Management
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-3 max-w-sm">
          <h1 className="text-xl font-bold tracking-tight text-white">Empowering Student Journeys Abroad</h1>
          <p className="text-muted text-[11px] leading-relaxed">
            Track each lead from first inquiry to destination readiness with calm, focused clarity.
          </p>
        </div>

        <div className="relative z-10 text-[9px] text-muted font-semibold tracking-wider uppercase">
          Vantage Center © 2026
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10 bg-canvas">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center lg:hidden text-center space-y-3 mb-6">
            <div className="h-12 w-12 rounded-[8px] bg-accent flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-ink uppercase">VANTAGE CENTER</h1>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Internal Operations</p>
            </div>
          </div>

          <div className="text-center lg:text-left space-y-1">
            <h2 className="text-lg font-bold text-ink tracking-tight">Operator Login</h2>
            <p className="text-muted text-xs">Sign in with your Vantage executive credentials.</p>
          </div>

          <div className="bg-surface border border-border rounded-[8px] p-6 relative">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[9px] font-bold uppercase tracking-widest text-muted">
                  Work Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full px-3 py-2 bg-surface border rounded-[8px] text-xs text-ink placeholder-muted focus:outline-none transition-all ${
                    errors.email ? 'border-danger' : 'border-border'
                  }`}
                  placeholder="operator@vantagecentre.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-[10px] text-danger font-semibold">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-[9px] font-bold uppercase tracking-widest text-muted">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full pl-3 pr-10 py-2 bg-surface border rounded-[8px] text-xs text-ink placeholder-muted focus:outline-none transition-all ${
                      errors.password ? 'border-danger' : 'border-border'
                    }`}
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-danger font-semibold">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded-[8px] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent"></span>
                ) : (
                  <span>Access Dashboard</span>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-[8px] text-muted font-bold uppercase tracking-wider pt-2">
            Authorized Executive Staff Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
};
