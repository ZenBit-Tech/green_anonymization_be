import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import PricingService from '../pricing.service';

@Injectable()
export default class SubscriptionLimitGuard implements CanActivate {
  constructor(private readonly pricingService: PricingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { email: string }; query?: { documentId?: string } }>();

    const email = request.user?.email;
    if (!email) return false;

    if (request.query?.documentId) {
      await this.pricingService.checkDailyReanalysisLimit(email);
    } else {
      await this.pricingService.checkDailyLimitByEmail(email);
    }

    return true;
  }
}
