import { AuthProviders } from '@/common/constants';

export type GoogleUser = {
  provider: AuthProviders;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
};
