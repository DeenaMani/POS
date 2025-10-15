import { Router } from 'express'
import { Sales } from './sale.controller';
import { ValidationService } from './sales.validatioRules';

const saleRoutes = Router();

/**
 * Sales Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting sales.
 */

/* ➕ Create a new sales
Endpoint: POST /create
Description: Adds a new sales to the system using provided data (e.g., business_name, contact, etc.). */
saleRoutes.post('/entry', ValidationService.salesEntryRules(), Sales.entry);

/* 🔍 List all sales for a 
Endpoint: GET /list
Description: Retrieves a list of all sales for a given  (filter by ). */
saleRoutes.get('/list', Sales.list);

/* 🛠️ Fetch Sales by ID for editing
Endpoint: GET /view/:id
Description: Retrieves a sales's existing data by ID, typically used to populate an edit form. */
saleRoutes.get("/view/:id", Sales.view);

/* 🛠️ Fetch Sales by ID for editing
Endpoint: GET /edit/:id
Description: Retrieves a sales's existing data by ID, typically used to populate an edit form. */
saleRoutes.get("/edit/:id", Sales.edit);

/* ✏️ Update an existing sales by ID
Endpoint: PUT /update/:id
Description: Updates sales information based on the provided ID and new data. */
saleRoutes.put("/update/:id", Sales.update);

/* 🗑️ Delete a sales by ID
Endpoint: DELETE /delete/:id
Description: Deletes a sales record from the system based on sale_id. */
saleRoutes.delete("/delete/:id", Sales.delete);


export default saleRoutes;
