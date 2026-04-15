import User from '@/common/db/entities/user.entity';

export default class SessionResponseDto {
  registered: boolean = false;

  user: User | null = null;
}
