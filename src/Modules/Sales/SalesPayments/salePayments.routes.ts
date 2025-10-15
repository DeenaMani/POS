import { Router } from 'express'
import { SalesPaymentController } from './salePayments.controller';


const salePaymentsRoutes = Router();

/**
 * 💰 Sales Payments Management Module
 * Handles operations such as recording, listing, viewing, editing, updating, and deleting sales payment records.
 */

/* ➕ Record a new sales payment
   Method: POST
   Endpoint: /entry
   Description: Records a new payment against a sale using provided data (e.g., amount, mode, customer, etc.).
*/
salePaymentsRoutes.post('/entry', SalesPaymentController.entry);

/* 📃 List all sales payments for a 
   Method: GET
   Endpoint: /list
   Description: Retrieves a list of all sales payment records filtered by .
*/
salePaymentsRoutes.get('/list', SalesPaymentController.list);

/* 🔍 View sales payment details by ID
   Method: GET
   Endpoint: /view/:id
   Description: Retrieves detailed information of a specific sales payment record by ID.
*/
salePaymentsRoutes.get('/view/:id', SalesPaymentController.view);

/* 🛠️ Fetch sales payment data for editing
   Method: GET
   Endpoint: /edit/:id
   Description: Retrieves sales payment data by ID, typically used to populate an edit form.
*/
salePaymentsRoutes.get('/edit/:id', SalesPaymentController.edit);

/* ✏️ Update an existing sales payment
   Method: PUT
   Endpoint: /update/:id
   Description: Updates a sales payment record based on the provided ID and data.
*/
salePaymentsRoutes.put('/update/:id', SalesPaymentController.update);

/* 🗑️ Delete a sales payment record
   Method: DELETE
   Endpoint: /delete/:id
   Description: Deletes a sales payment record from the system by ID.
*/
salePaymentsRoutes.delete('/delete/:id', SalesPaymentController.delete);

export default salePaymentsRoutes;
