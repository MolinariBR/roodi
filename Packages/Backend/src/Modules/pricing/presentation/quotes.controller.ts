import type { NextFunction, Request, Response } from "express";

import { AppError } from "@core/http/errors/app-error";
import { getAuthContext } from "@core/http/middlewares/authenticate";
import { QuoteService } from "@modules/pricing/application/quote.service";
import { quoteRequestSchema } from "@modules/pricing/domain/quote.schemas";

export class QuotesController {
  constructor(private readonly quoteService = new QuoteService()) {}

  public createQuote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can create quotes.",
          statusCode: 403,
        });
      }

      const payload = quoteRequestSchema.parse(req.body);
      if (payload.commerce_id && payload.commerce_id !== authContext.userId) {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Payload commerce_id does not match authenticated user.",
          statusCode: 403,
        });
      }

      const responseBody = await this.quoteService.createQuote({
        commerceUserId: authContext.userId,
        payload,
      });

      res.locals.auditEntityId = responseBody.data.quote_id;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };
}
