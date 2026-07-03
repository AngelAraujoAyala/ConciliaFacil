import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/apiClient';

import type { UserPlan, Empresa } from '../../../types';

// Definimos el tipo basado estrictamente en tu modelo de Prisma
export interface UserProfile {
  id: string;
  email: string;
  isSubscribed: boolean;
  freeConciliationsLeft: number;
  plan: UserPlan;
  monthlyConciliations: number;
  nextResetDate: string;
  empresas: Empresa[];
  createdAt: string;
  _count: {
    conciliations: number;
  };
}

const fetchProfile = async (): Promise<UserProfile> => {
  const { data } = await apiClient.get<UserProfile>('/users/me');
  return data;
};

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchProfile,
    retry: false, // Si da 401, no reintentar innecesariamente
  });
};