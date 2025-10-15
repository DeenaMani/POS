import Router from "express";
import productRoutes from "./Product/product.routes";
import categoryRouter from "./Category/category.routes";
import productUnitRoutes from "./Unit/productunit.routes";
import productBrandRoutes from "./Brand/productbrand.routes";

const productsRouter = Router();

/**
 * Handles category management.
 */
productsRouter.use('/category', categoryRouter);

/**
 * Handles product management.
 */
productsRouter.use('/', productRoutes);

/**
 * Handles product unit management.
 */
productsRouter.use('/unit', productUnitRoutes);

/**
 * Handles product brand management.
 */
productsRouter.use('/brand', productBrandRoutes);

export default productsRouter;