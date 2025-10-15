import { ErrorService } from "../../../Services/ErrorService";
import { ResponseService } from "../../../Services/ResponseService";
import SalesPaymentsModel from "./salePayments.model";

export class SalesPaymentController {
    /**
     * 
     * @description Handles the entry of a new sales payment record.
     * This method processes the request to create a new sales payment entry
     * and sends a response back to the client.
     */
    public static async list(req: any, res: any) {
        try {
           
            const customerId = req.body?.customer_id;
            const bill_number = req.body?.bill_number;
            const filter: any = { };
            const limit = parseInt(req.body?.limit) || 10;
            const page = parseInt(req.body?.page) || 1;
            const skip = (page - 1) * limit;
            if (customerId) filter.customer_id = customerId;
            if (bill_number) filter.bill_number = bill_number;
            const payments = await SalesPaymentsModel.find(filter, { created_at: 0, updated_at: 0, __v: 0, _id: 0 }).sort({ payment_date: -1 }).skip(skip).limit(limit);

            ResponseService.jsonResponse(200, payments, res, req, "Sale fetched successfully");
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


