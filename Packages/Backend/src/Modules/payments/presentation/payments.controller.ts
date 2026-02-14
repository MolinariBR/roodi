import type { NextFunction, Request, Response } from "express";

import { getAuthContext } from "@core/http/middlewares/authenticate";
import { PaymentsService } from "@modules/payments/application/payments.service";
import {
  adminPaymentTransactionListQuerySchema,
  createCreditPurchaseIntentRequestSchema,
  infinitePayWebhookPayloadSchema,
  paymentCheckRequestSchema,
  paymentIdParamSchema,
  transactionIdParamSchema,
} from "@modules/payments/domain/payments.schemas";

const resolveWebhookSecret = (req: Request): string | undefined => {
  const explicitSecret = req.header("x-webhook-secret") ?? req.header("x-infinitepay-secret");
  if (explicitSecret) {
    return explicitSecret;
  }

  const authorizationHeader = req.header("authorization");
  if (!authorizationHeader) {
    return undefined;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : undefined;
};

export class PaymentsController {
  constructor(private readonly paymentsService = new PaymentsService()) {}

  public listAdminPaymentTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = adminPaymentTransactionListQuerySchema.parse(req.query);
      const responseBody = await this.paymentsService.listAdminPaymentTransactions(query);

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getAdminPaymentTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const params = transactionIdParamSchema.parse(req.params);
      const responseBody = await this.paymentsService.getAdminPaymentTransaction(
        params.transactionId,
      );

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public createCreditPurchaseIntent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const payload = createCreditPurchaseIntentRequestSchema.parse(req.body);
      const responseBody = await this.paymentsService.createCreditPurchaseIntent({
        commerceUserId: authContext.userId,
        payload,
      });

      res.locals.auditEntityId = responseBody.data.payment_id;
      res.status(201).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public checkCommercePayment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const params = paymentIdParamSchema.parse(req.params);
      const payload = paymentCheckRequestSchema.parse(req.body);

      const responseBody = await this.paymentsService.checkCommercePayment({
        commerceUserId: authContext.userId,
        paymentId: params.paymentId,
        payload,
      });

      res.locals.auditEntityId = params.paymentId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public receiveInfinitePayWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const payload = infinitePayWebhookPayloadSchema.parse(req.body);
      const result = await this.paymentsService.processInfinitePayWebhook({
        payload,
        providedSecret: resolveWebhookSecret(req),
      });

      res.status(200).json({
        success: true,
        data: {
          processed: result.processed,
          idempotent: result.idempotent,
        },
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}
