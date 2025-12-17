import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./services/payments.service";
import { PaymentGatewayFactory } from "./services/payment-gateway.factory";
import { PaymentTransactionService } from "./services/payment-transaction.service";
import { WebhookService } from "./services/webhook.service";
import { PaystackService } from "./gateways/paystack.service";
import { MonnifyService } from "./gateways/monnify.service";
import { PaymentTransaction } from "./entities/payment-transaction.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTransaction]), AuthModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentGatewayFactory,
    PaymentTransactionService,
    WebhookService,
    PaystackService,
    MonnifyService,
  ],
  exports: [
    PaymentsService,
    PaymentGatewayFactory,
    PaymentTransactionService,
  ],
})
export class PaymentsModule {}
