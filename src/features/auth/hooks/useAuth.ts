'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/contexts/AuthContext';
export { useAuth };
import { authService } from '@/features/auth/services/authService';
import type { LoginPayload, RegisterPayload } from '@/features/auth/services/authService';

export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const result = await authService.login(payload);
      login({ email: result.email, role: result.role as 'buyer' | 'seller', token: result.token });
      return result;
    },
    onSuccess: (result) => {
      router.push(result.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer');
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      await authService.register(payload);
      // After registration redirect to login
      return payload.role;
    },
    onSuccess: () => {
      router.push('/login?registered=true');
    },
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();

  return () => {
    logout();
    router.push('/login');
  };
}
