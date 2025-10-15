import Router from "express";
import PrefixSettings from "./prefixSettings.controller";

const prefixSettingsRouter = Router();
/**
 * User Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting users.
 */

/* 🔍 List all prefix settings
Endpoint: GET /list
Description: Retrieves a list of all prefix settings with optional filters or pagination. */
prefixSettingsRouter.get("/list", PrefixSettings.list);

/* ➕ Create a new prefix setting
Endpoint: POST /create
Description: Adds a new prefix setting to the system using provided data (e.g., name, email, etc.). */
prefixSettingsRouter.post("/create", PrefixSettings.create);

/* 🛠️ Fetch prefix setting by ID for editing
Endpoint: GET /edit/:id
Description: Retrieves a prefix setting's existing data by ID, typically used to populate an edit form. */
prefixSettingsRouter.get("/edit/:id", PrefixSettings.edit);

/* ✏️ Update an existing prefix setting by ID
Endpoint: PUT /update/:id
Description: Updates prefix setting information based on the provided ID and new data. */
prefixSettingsRouter.put("/update/:id", PrefixSettings.update);

/* 🗑️ Delete a prefix setting by ID
Endpoint: DELETE /delete/:id
Description: Soft or hard deletes a prefix setting record from the system based on ID. */
/* prefixSettingsRouter.delete("/delete/:id", PrefixSettings.delete); */

export default prefixSettingsRouter;