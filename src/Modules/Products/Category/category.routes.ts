
import Router from "express";
import { ProductCategory } from "./category.controller";

const categoryRouter = Router();

/**
 * Category Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting category.
 */

/* 🔍 List all categories
Endpoint: GET /list
Description: Retrieves a list of all categories with optional filters or pagination. */
categoryRouter.get("/list", ProductCategory.list);

/* ➕ Create a new category
Endpoint: POST /create
Description: Adds a new category to the system using provided data (e.g., category name, etc.). */
categoryRouter.post("/create", ProductCategory.create);

/* 🛠️ Fetch category by ID for editing
Endpoint: GET /edit/:id
Description: Retrieves a categories's existing data by ID, typically used to populate an edit form. */
categoryRouter.get("/edit/:id", ProductCategory.edit);

/* ✏️ Update an existing category by ID
Endpoint: PUT /update/:id
Description: Updates category information based on the provided ID and new data. */
categoryRouter.put("/update/:id", ProductCategory.update);

/* 🗑️ Delete a category by ID
Endpoint: DELETE /delete/:id
Description: Soft or hard deletes a category record from the system based on ID. */
categoryRouter.delete("/delete/:id", ProductCategory.delete);

export default categoryRouter;