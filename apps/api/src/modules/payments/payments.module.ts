import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentGatewayFactory } from './services/payment-gateway.factory';
import { PaystackService } from './gateways/paystack.service';
import { MonnifyService } from './gateways/monnify.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentGatewayFactory,
    PaystackService,
    MonnifyService,
  ],
  exports: [PaymentsService, PaymentGatewayFactory],
})
export class PaymentsModule {}
