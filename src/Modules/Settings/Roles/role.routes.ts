import Router from "express";
import { Roles } from "./role.controller";

const roleRouter = Router();

/**
 * Role Management Module
 * This module handles the management of user roles within the application.
 * It includes operations such as listing, creating, editing, updating, and deleting roles.
 * Each operation is defined as a route with a specific HTTP method and endpoint.
 */

/* 🔍 List all roles
Endpoint: GET /list
Description: Retrieves a list of all roles with optional filters or pagination. */
roleRouter.get("/list", Roles.list);

/**
 * ➕ Create a new role
 * Endpoint: POST /create
 * Description: Creates a new role with the provided details.
 * The request body should contain the necessary information for the role, such as name and permissions.
 */
roleRouter.post("/create", Roles.create);
/**
 * ✏️ Edit an existing role
 * Endpoint: GET /edit/:id
 * Description: Retrieves the details of a specific role for editing.
 * The :id parameter should be replaced with the actual role ID.
 */
roleRouter.get("/edit/:id", Roles.edit);
/**
 * 🔄 Update an existing role
 * Endpoint: PUT /update/:id
 * Description: Updates the details of a specific role.
 * The :id parameter should be replaced with the actual role ID, and the request body should contain the updated information.
 */
roleRouter.put("/update/:id", Roles.update);
/**
 * ❌ Delete a role
 * Endpoint: DELETE /delete/:id
 * Description: Deletes a specific role.
 * The :id parameter should be replaced with the actual role ID to be deleted.
 */
roleRouter.delete("/delete/:id", Roles.delete);

export default roleRouter;