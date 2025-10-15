
import Router from "express";
import { Products } from "./product.controller";

const productsRoutes = Router();

/**
 * Product Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting product.
 */

/* 🔍 List all product
Endpoint: GET /list
Description: Retrieves a list of all product with optional filters or pagination. */
productsRoutes.get("/list", Products.list);

/* ➕ Create a new product
Endpoint: POST /create
Description: Adds a new product to the system using provided data (e.g., product name, product code, etc.). */
productsRoutes.post("/create", Products.create);

/* 🛠️ Fetch product by ID for editing
Endpoint: GET /edit/:id
Description: Retrieves a product's existing data by ID, typically used to populate an edit form. */
productsRoutes.get("/edit/:id", Products.edit);

/* ✏️ Update an existing product by ID
Endpoint: PUT /update/:id
Description: Updates product information based on the provided ID and new data. */
productsRoutes.put("/update/:id", Products.update);

/* 🗑️ Delete a product by ID
Endpoint: DELETE /delete/:id
Description: Soft or hard deletes a product record from the system based on ID. */
productsRoutes.delete("/delete/:id", Products.delete);

/* 🔄 Update product availability by ID
Endpoint: PUT /availability/:id
Description: Updates the availability status of a product based on the provided ID and new availability data. */
productsRoutes.put("/availability/:id", Products.updateAvailability);


export default productsRoutes;