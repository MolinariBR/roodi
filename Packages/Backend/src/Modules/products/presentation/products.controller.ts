import type { NextFunction, Request, Response } from "express";

import { AppError } from "@core/http/errors/app-error";
import { getAuthContext } from "@core/http/middlewares/authenticate";
import { ProductsService } from "@modules/products/application/products.service";
import {
  productIdParamSchema,
  productListQuerySchema,
  productStatusUpdateRequestSchema,
  productUpsertRequestSchema,
} from "@modules/products/domain/products.schemas";

export class ProductsController {
  constructor(private readonly productsService = new ProductsService()) {}

  public listCommerceProducts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can list products.",
          statusCode: 403,
        });
      }

      const query = productListQuerySchema.parse(req.query);
      const responseBody = await this.productsService.listCommerceProducts({
        commerceUserId: authContext.userId,
        query,
      });

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public createCommerceProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can create products.",
          statusCode: 403,
        });
      }

      const payload = productUpsertRequestSchema.parse(req.body);
      const responseBody = await this.productsService.createCommerceProduct({
        commerceUserId: authContext.userId,
        payload,
      });

      res.locals.auditEntityId = responseBody.id;
      res.status(201).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public updateCommerceProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can update products.",
          statusCode: 403,
        });
      }

      const params = productIdParamSchema.parse(req.params);
      const payload = productUpsertRequestSchema.parse(req.body);
      const responseBody = await this.productsService.updateCommerceProduct({
        commerceUserId: authContext.userId,
        productId: params.productId,
        payload,
      });

      res.locals.auditEntityId = params.productId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public updateCommerceProductStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can update product status.",
          statusCode: 403,
        });
      }

      const params = productIdParamSchema.parse(req.params);
      const payload = productStatusUpdateRequestSchema.parse(req.body);
      const responseBody = await this.productsService.updateCommerceProductStatus({
        commerceUserId: authContext.userId,
        productId: params.productId,
        payload,
      });

      res.locals.auditEntityId = params.productId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };
}
