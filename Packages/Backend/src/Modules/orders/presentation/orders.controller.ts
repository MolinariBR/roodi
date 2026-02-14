import type { NextFunction, Request, Response } from "express";

import { AppError } from "@core/http/errors/app-error";
import { getAuthContext } from "@core/http/middlewares/authenticate";
import { OrdersService } from "@modules/orders/application/orders.service";
import {
  cancelOrderRequestSchema,
  createOrderRequestSchema,
  orderIdParamSchema,
  orderListQuerySchema,
} from "@modules/orders/domain/orders.schemas";

export class OrdersController {
  constructor(private readonly ordersService = new OrdersService()) {}

  public listAdminOrders = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = orderListQuerySchema.parse(req.query);
      const responseBody = await this.ordersService.listAdminOrders({ query });

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getAdminOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = orderIdParamSchema.parse(req.params);
      const responseBody = await this.ordersService.getAdminOrder(params.orderId);

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public listCommerceOrders = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can list commerce orders.",
          statusCode: 403,
        });
      }

      const query = orderListQuerySchema.parse(req.query);
      const responseBody = await this.ordersService.listCommerceOrders({
        commerceUserId: authContext.userId,
        query,
      });

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public createCommerceOrder = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can create orders.",
          statusCode: 403,
        });
      }

      const payload = createOrderRequestSchema.parse(req.body);
      const responseBody = await this.ordersService.createCommerceOrder({
        commerceUserId: authContext.userId,
        payload,
      });

      res.locals.auditEntityId = responseBody.id;
      res.status(201).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getCommerceOrder = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can get commerce orders.",
          statusCode: 403,
        });
      }

      const params = orderIdParamSchema.parse(req.params);
      const responseBody = await this.ordersService.getCommerceOrder({
        commerceUserId: authContext.userId,
        orderId: params.orderId,
      });

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public cancelCommerceOrder = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can cancel commerce orders.",
          statusCode: 403,
        });
      }

      const params = orderIdParamSchema.parse(req.params);
      const payload = cancelOrderRequestSchema.parse(req.body);
      const responseBody = await this.ordersService.cancelCommerceOrder({
        commerceUserId: authContext.userId,
        orderId: params.orderId,
        payload,
      });

      res.locals.auditEntityId = params.orderId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getRiderActiveOrder = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "rider") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only rider users can access rider orders.",
          statusCode: 403,
        });
      }

      const activeOrder = await this.ordersService.getRiderActiveOrder(authContext.userId);
      if (!activeOrder) {
        res.status(204).send();
        return;
      }

      res.status(200).json(activeOrder);
    } catch (error: unknown) {
      next(error);
    }
  };

  public listRiderOrderHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "rider") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only rider users can access rider order history.",
          statusCode: 403,
        });
      }

      const query = orderListQuerySchema.parse(req.query);
      const responseBody = await this.ordersService.listRiderOrderHistory({
        riderUserId: authContext.userId,
        query,
      });

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getRiderOrder = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "rider") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only rider users can access rider orders.",
          statusCode: 403,
        });
      }

      const params = orderIdParamSchema.parse(req.params);
      const responseBody = await this.ordersService.getRiderOrder({
        riderUserId: authContext.userId,
        orderId: params.orderId,
      });

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };
}
