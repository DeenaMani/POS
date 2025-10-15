import { Router } from 'express'
import saleRoutes from './Sales/sale.routes';
import salePaymentsRoutes from './SalesPayments/salePayments.routes';

const salesRoutes = Router();

/**
 * Sales Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting sales.
 */
salesRoutes.use('/', saleRoutes);

/**
 * Sales Payments Management Module
 * Handles operations such as recording, listing, viewing, editing, updating, and deleting sales payment records.
 */
salesRoutes.use('/payments', salePaymentsRoutes);

export default salesRoutes;
