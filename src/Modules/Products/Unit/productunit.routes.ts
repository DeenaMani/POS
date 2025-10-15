
import Router from "express";
import { ProductUnitController } from "./productunit.controller";

const productUnitRoutes = Router();

/**
 * Unit Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting units.
 */

/* 🔍 List all units
Endpoint: GET /list
Description: Retrieves a list of all units with optional filters or pagination. */
productUnitRoutes.get("/list", ProductUnitController.list);

/* ➕ Create a new unit
Endpoint: POST /create
Description: Adds a new unit to the system using provided data (e.g., unit name, etc.). */
productUnitRoutes.post("/create", ProductUnitController.create);

/* 🛠️ Fetch unit by ID for editing
Endpoint: GET /edit/:id
Description: Retrieves a unit's existing data by ID, typically used to populate an edit form. */
productUnitRoutes.get("/edit/:id", ProductUnitController.edit);

/* ✏️ Update an existing unit by ID
Endpoint: PUT /update/:id
Description: Updates unit information based on the provided ID and new data. */
productUnitRoutes.put("/update/:id", ProductUnitController.update);

/* 🗑️ Delete a unit by ID
Endpoint: DELETE /delete/:id
Description: Soft or hard deletes a unit record from the system based on ID. */
productUnitRoutes.delete("/delete/:id", ProductUnitController.delete);

export default productUnitRoutes;