import { AuthProviders } from '@/common/constants';

export type OAuthUser = {
  provider: AuthProviders;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
};
