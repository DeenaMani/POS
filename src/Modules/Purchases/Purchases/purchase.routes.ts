import { Router } from 'express'
import { PurchaseController } from './purchase.controller';


const purchaseRoutes = Router();

/**
 * Sales Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting sales.
 */

/* ➕ Create a new sales
Endpoint: POST /create
Description: Adds a new sales to the system using provided data (e.g., business_name, contact, etc.). */
purchaseRoutes.post('/create', PurchaseController.create);

/* 🔍 List all sales for a 
Endpoint: GET /list
Description: Retrieves a list of all sales for a given  (filter by ). */
purchaseRoutes.get('/list', PurchaseController.list);

/* 🛠️ Fetch Sales by ID for editing
Endpoint: GET /view/:id
Description: Retrieves a sales's existing data by ID, typically used to populate an edit form. */
purchaseRoutes.get("/getdetails/:id", PurchaseController.view);



export default purchaseRoutes;
