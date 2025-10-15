import { ErrorService } from "../../../Services/ErrorService";
import { ResponseService } from "../../../Services/ResponseService";
import { PurchasePayments } from "../PurchasePayments/purchase.payments.model";

export class PurchasePaymentController {
    /**
     * @description Handles the retrieval of sales payment records.
     * This method processes the request to fetch sales payment entries
     * and sends a response back to the client.
     */
    public static async list(req: any, res: any) {
        try {
           
            const supplier_id = req.body?.supplier_id;
            const invoice_number = req.body?.invoice_number;
            const filter: any = { };
            const limit = parseInt(req.body?.limit) || 10;
            const page = parseInt(req.body?.page) || 1;
            const skip = (page - 1) * limit;
            if (supplier_id) filter.supplier_id = supplier_id;
            if (invoice_number) filter.invoice_number = invoice_number;
            const payments = await PurchasePayments.find(filter, { created_at: 0, updated_at: 0, __v: 0, _id: 0 }).sort({ payment_date: -1 }).skip(skip).limit(limit);

            ResponseService.jsonResponse(200, payments, res, req, "Purchase fetched successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }
    public static async entry(req: any, res: any) { }
    public static async view(req: any, res: any) { }
    public static async edit(req: any, res: any) { }
    public static async update(req: any, res: any) { }
    public static async delete(req: any, res: any) { }
}


