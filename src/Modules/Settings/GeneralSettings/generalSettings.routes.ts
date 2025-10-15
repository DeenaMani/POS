import Router from "express";
import GeneralSettings from "./generalSettings.controller";

const generalSettingsRouter = Router();
/**
 * User Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting users.
 */

/* 🔍 List all general settings
Endpoint: GET /list
Description: Retrieves a list of all general settings with optional filters or pagination. */
generalSettingsRouter.get("/list", GeneralSettings.list);

/* ➕ Create a new general setting
Endpoint: POST /create
Description: Adds a new general setting to the system using provided data (e.g., name, email, etc.). */
generalSettingsRouter.post("/create", GeneralSettings.create);

/* 🛠️ Fetch general setting by ID for editing
Endpoint: GET /edit/:id
Description: Retrieves a general setting's existing data by ID, typically used to populate an edit form. */
generalSettingsRouter.get("/edit/:id", GeneralSettings.edit);

/* ✏️ Update an existing general setting by ID
Endpoint: PUT /update/:id
Description: Updates general setting information based on the provided ID and new data. */
generalSettingsRouter.put("/update/:id", GeneralSettings.update);

/* 🗑️ Delete a general setting by ID
Endpoint: DELETE /delete/:id
Description: Soft or hard deletes a general setting record from the system based on ID. */
/* generalSettingsRouter.delete("/delete/:id", GeneralSettings.delete); */


export default generalSettingsRouter;