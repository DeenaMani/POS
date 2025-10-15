import { Router } from 'express';
import { CustomerController } from './customer.controller';

const customerRoutes = Router();


/**
 * Client Management Module
 * Handles operations such as listing, creating, editing, updating, and deleting clients.
 */

/* 🔍 List all clients for a 
Endpoint: GET /list
Description: Retrieves a list of all clients for a given  (filter by ). */
customerRoutes.get('/list', CustomerController.list);

/* ➕ Create a new client
Endpoint: POST /create
Description: Adds a new client to the system using provided data (e.g., business name, contact, etc.). */
customerRoutes.post('/create', CustomerController.create);

/* 🛠️ Fetch client by ID for editing
Endpoint: GET /edit/:id
Description: Retrieves a client's existing data by client_id, typically used to populate an edit form. */
customerRoutes.get('/edit/:id', CustomerController.edit);

/* ✏️ Update an existing client by ID
Endpoint: PUT /update/:id
Description: Updates client information based on the provided client_id and new data. */
customerRoutes.put('/update/:id', CustomerController.update);

/* 🗑️ Delete a client by ID
Endpoint: DELETE /delete/:id
Description: Deletes a client record from the system based on client_id. */
customerRoutes.delete('/delete/:id', CustomerController.delete);

export default customerRoutes;
