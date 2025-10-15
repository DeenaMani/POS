import Router from "express";
import BusinessSettings from "./businessSettings.controller";

const businessSettingsRouter = Router();
/**
 * User Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting users.
 */

/* 🔍 List all business settings
Endpoint: GET /list
Description: Retrieves a list of all business settings with optional filters or pagination. */
businessSettingsRouter.get("/list", BusinessSettings.list);

/* ➕ Create a new business setting
Endpoint: POST /create
Description: Adds a new business setting to the system using provided data (e.g., name, email, etc.). */
businessSettingsRouter.post("/create", BusinessSettings.create);

/* 🛠️ Fetch business setting by ID for editing
Endpoint: GET /edit/:id
Description: Retrieves a business setting's existing data by ID, typically used to populate an edit form. */
businessSettingsRouter.get("/edit/:id", BusinessSettings.edit);

/* ✏️ Update an existing business setting by ID
Endpoint: PUT /update/:id
Description: Updates business setting information based on the provided ID and new data. */
businessSettingsRouter.put("/update/:id", BusinessSettings.update);

/* 🗑️ Delete a business setting by ID
Endpoint: DELETE /delete/:id
Description: Soft or hard deletes a business setting record from the system based on ID. */
/* businessSettingsRouter.delete("/delete/:id", BusinessSettings.delete); */


export default businessSettingsRouter;