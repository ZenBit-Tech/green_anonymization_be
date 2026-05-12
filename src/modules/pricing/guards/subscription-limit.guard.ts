import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import PricingService from '../pricing.service';

@Injectable()
export default class SubscriptionLimitGuard implements CanActivate {
  constructor(private readonly pricingService: PricingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { email: string } }>();

    const email = request.user?.email;
    if (!email) return false;

    await this.pricingService.checkDailyLimitByEmail(email);

    return true;
  }
}
