import type { NextFunction, Request, Response } from "express";

import { AppError } from "@core/http/errors/app-error";
import { getAuthContext } from "@core/http/middlewares/authenticate";
import { ClientsService } from "@modules/clients/application/clients.service";
import {
  clientIdParamSchema,
  clientListQuerySchema,
  clientUpsertRequestSchema,
} from "@modules/clients/domain/clients.schemas";

export class ClientsController {
  constructor(private readonly clientsService = new ClientsService()) {}

  public listCommerceClients = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can list clients.",
          statusCode: 403,
        });
      }

      const query = clientListQuerySchema.parse(req.query);
      const responseBody = await this.clientsService.listCommerceClients({
        commerceUserId: authContext.userId,
        query,
      });

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public createCommerceClient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can create clients.",
          statusCode: 403,
        });
      }

      const payload = clientUpsertRequestSchema.parse(req.body);
      const responseBody = await this.clientsService.createCommerceClient({
        commerceUserId: authContext.userId,
        payload,
      });

      res.locals.auditEntityId = responseBody.id;
      res.status(201).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public updateCommerceClient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can update clients.",
          statusCode: 403,
        });
      }

      const params = clientIdParamSchema.parse(req.params);
      const payload = clientUpsertRequestSchema.parse(req.body);
      const responseBody = await this.clientsService.updateCommerceClient({
        commerceUserId: authContext.userId,
        clientId: params.clientId,
        payload,
      });

      res.locals.auditEntityId = params.clientId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };
}
