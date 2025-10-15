import Router from "express";
import { Users } from "./user.controller";

const userRouter = Router();

/**
 * User Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting users.
 */

/* 🔍 List all users
Endpoint: GET /list
Description: Retrieves a list of all users with optional filters or pagination. */
userRouter.get("/list", Users.list);

/* ➕ Create a new user
Endpoint: POST /create
Description: Adds a new user to the system using provided data (e.g., name, email, etc.). */
userRouter.post("/create", Users.create);

/* 🛠️ Fetch user by ID for editing
Endpoint: GET /edit/:id
Description: Retrieves a user's existing data by ID, typically used to populate an edit form. */
userRouter.get("/edit/:id", Users.edit);

/* ✏️ Update an existing user by ID
Endpoint: PUT /update/:id
Description: Updates user information based on the provided ID and new data. */
userRouter.put("/update/:id", Users.update);

/* 🗑️ Delete a user by ID
Endpoint: DELETE /delete/:id
Description: Soft or hard deletes a user record from the system based on ID. */
/* userRouter.delete("/delete/:id", Users.delete); */


export default userRouter;