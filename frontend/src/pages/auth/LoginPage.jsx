import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginByRole } from '@/services/authService';
import { getDashboardPath } from '@/utils/roleRedirect';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const roles = [
  { id: 'student', label: 'Student' },
  { id: 'faculty', label: 'Faculty' },
  { id: 'admin', label: 'Admin' },
];

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState(roles[0]);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await loginByRole(activeRole.id, {
        email: data.email,
        password: data.password,
      });

      const resData = response?.data || response;
      const user = resData.user || resData.admin || resData.faculty;
      
      // Save token (though it's in httpOnly cookies, it's safe to have standard flow)
      // Call auth context login
      login(user, activeRole.id);
      toast.success(response?.message || 'Logged in successfully!');

      // Handling First Login / Onboarding logic for Students
      if (activeRole.id === 'student') {
        if (resData.forcePasswordChange || user.isFirstLogin) {
          navigate('/force-change-password');
        } else if (!user.isOnboarded) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard/student');
        }
      } else if (activeRole.id === 'faculty') {
        navigate(getDashboardPath(user?.role || activeRole.id));
      } else if (activeRole.id === 'admin') {
        navigate(getDashboardPath(user?.role || activeRole.id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to login. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-[var(--bg-card)] p-8 shadow-xl border border-[var(--border)]">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[var(--text-h)] font-heading tracking-tight">
            Welcome to Unisphere
          </h2>
          <p className="mt-2 text-sm text-[var(--text)]">
            Log in to manage your campus ecosystem
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex rounded-lg bg-[var(--bg-card-alt)] p-1">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role)}
              className={`relative flex-1 rounded-md py-2 text-sm font-medium transition-all focus:outline-none ${
                activeRole.id === role.id
                  ? 'text-[var(--primary)] shadow-sm'
                  : 'text-[var(--text)] hover:text-[var(--text-h)]'
              }`}
            >
              {activeRole.id === role.id && (
                <span className="absolute inset-0 rounded-md bg-[var(--bg-card)] border border-[var(--border)] shadow-sm" />
              )}
              <span className="relative z-10">{role.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <form
            key={activeRole.id}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-[var(--text-h)] mb-1">
                Email Address
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder={`Enter your ${activeRole.label.toLowerCase()} email`}
                error={errors.email?.message}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-[var(--text-h)]">
                  Password
                </label>
                <a href={`/forgot-password?role=${activeRole.id}`} className="text-sm font-medium text-[var(--primary)] hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign in as {activeRole.label}
            </Button>
          </form>
        </AnimatePresence>
      </div>
    </div>
  );
}
