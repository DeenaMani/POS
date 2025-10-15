import { Router } from 'express'
import { PurchasePaymentController } from './purchase.payment.controller';


const purchaseRoutes = Router();

/**
 * Sales Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting sales.
 */

/* 🔍 List all sales for a 
Endpoint: GET /list
Description: Retrieves a list of all sales for a given  (filter by ). */
purchaseRoutes.get('/list', PurchasePaymentController.list);





export default purchaseRoutes;
