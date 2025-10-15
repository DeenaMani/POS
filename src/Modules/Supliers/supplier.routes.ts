import { Router } from "express";
import { Suppliers } from "./supplier.controller";


const supplierRoutes = Router();

/**
 * Supplier Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting suppliers.
 */

/* 🔍 List all suppliers
Endpoint: GET /list
Description: Retrieves a list of all suppliers with optional filters or pagination. */
supplierRoutes.get("/list", Suppliers.list);

/* ➕ Create a new supplier
Endpoint: POST /create
Description: Adds a new supplier to the system using provided data (e.g., business_name, mobile_number, etc.). */
supplierRoutes.post("/create", Suppliers.create);

/* 🛠️ Fetch supplier by ID for editing
Endpoint: GET /edit/:id
Description: Retrieves a supplier's existing data by ID, typically used to populate an edit form. */
supplierRoutes.get("/edit/:id", Suppliers.edit);

/* ✏️ Update an existing supplier by ID
Endpoint: PUT /update/:id
Description: Updates supplier information based on the provided ID and new data. */
supplierRoutes.put("/update/:id", Suppliers.update);

/* 🗑️ Delete a supplier by ID
Endpoint: DELETE /delete/:id
Description: Deletes a supplier record from the system based on supplier_id. */
supplierRoutes.delete("/delete/:id", Suppliers.delete);

/**
 * Supplier Type Management
 * Endpoint: GET /suppliertype
 * Description: Retrieves a list of all supplier types. 
 */
supplierRoutes.get('/suppliertype', Suppliers.suppliertype);


export default supplierRoutes;