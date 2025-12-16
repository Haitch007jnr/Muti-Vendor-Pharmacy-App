import { Injectable, BadRequestException } from '@nestjs/common';
import { PaystackService } from '../gateways/paystack.service';
import { MonnifyService } from '../gateways/monnify.service';
import { IPaymentGateway, PaymentGateway } from '../interfaces/payment-gateway.interface';

@Injectable()
export class PaymentGatewayFactory {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly monnifyService: MonnifyService,
  ) {}

  getGateway(gateway: PaymentGateway): IPaymentGateway {
    switch (gateway) {
      case PaymentGateway.PAYSTACK:
        return this.paystackService;
      case PaymentGateway.MONNIFY:
        return this.monnifyService;
      default:
        throw new BadRequestException(`Unsupported payment gateway: ${gateway}`);
    }
  }
}
