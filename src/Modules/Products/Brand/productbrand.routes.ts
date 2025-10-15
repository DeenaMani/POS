
import Router from "express";
import { ProductBrandController } from "./productbrand.controller";

const productBrandRoutes = Router();

/**
 * Brand Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting brands.
 */

/* 🔍 List all brands
Endpoint: GET /list
Description: Retrieves a list of all brands with optional filters or pagination. */
productBrandRoutes.get("/list", ProductBrandController.list);

/* ➕ Create a new brand
Endpoint: POST /create
Description: Adds a new brand to the system using provided data (e.g., brand name, etc.). */
productBrandRoutes.post("/create", ProductBrandController.create);

/* 🛠️ Fetch brand by ID for editing
Endpoint: GET /edit/:id
Description: Retrieves a brand's existing data by ID, typically used to populate an edit form. */
productBrandRoutes.get("/edit/:id", ProductBrandController.edit);

/* ✏️ Update an existing brand by ID
Endpoint: PUT /update/:id
Description: Updates brand information based on the provided ID and new data. */
productBrandRoutes.put("/update/:id", ProductBrandController.update);

/* 🗑️ Delete a brand by ID
Endpoint: DELETE /delete/:id
Description: Soft or hard deletes a brand record from the system based on ID. */
productBrandRoutes.delete("/delete/:id", ProductBrandController.delete);

export default productBrandRoutes;