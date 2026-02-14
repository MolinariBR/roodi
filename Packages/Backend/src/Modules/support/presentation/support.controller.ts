import type { NextFunction, Request, Response } from "express";

import { getAuthContext } from "@core/http/middlewares/authenticate";
import { SupportService } from "@modules/support/application/support.service";
import {
  adminSupportTicketUpdateRequestSchema,
  supportTicketCreateRequestSchema,
  supportTicketIdParamSchema,
  supportTicketListQuerySchema,
} from "@modules/support/domain/support.schemas";

export class SupportController {
  constructor(private readonly supportService = new SupportService()) {}

  public listAdminSupportTickets = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = supportTicketListQuerySchema.parse(req.query);
      const responseBody = await this.supportService.listAdminSupportTickets(query);

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public updateAdminSupportTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const params = supportTicketIdParamSchema.parse(req.params);
      const payload = adminSupportTicketUpdateRequestSchema.parse(req.body);

      const responseBody = await this.supportService.updateAdminSupportTicket({
        ticketId: params.ticketId,
        payload,
        adminUserId: authContext.userId,
      });

      res.locals.auditEntityId = params.ticketId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public listFaqs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const responseBody = await this.supportService.listFaqs();
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public listSupportTickets = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const query = supportTicketListQuerySchema.parse(req.query);
      const responseBody = await this.supportService.listSupportTickets(authContext.userId, query);

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public createSupportTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const payload = supportTicketCreateRequestSchema.parse(req.body);
      const responseBody = await this.supportService.createSupportTicket(
        authContext.userId,
        payload,
      );

      res.locals.auditEntityId =
        typeof responseBody.id === "string" ? responseBody.id : undefined;
      res.status(201).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getSupportTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const params = supportTicketIdParamSchema.parse(req.params);
      const responseBody = await this.supportService.getSupportTicket(
        authContext.userId,
        params.ticketId,
      );

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };
}
