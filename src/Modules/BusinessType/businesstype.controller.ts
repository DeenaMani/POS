import { ErrorService } from "../../Services/ErrorService";
import { ResponseService } from "../../Services/ResponseService";
import BusinessTypeModel from "./businesstype.model";


export default class BusinessTypeController {
    /**
     * @description This method retrieves all business types from the database.
     */
    public static async list(req: any, res: any) {
        try {
            const status = req.body?.list_type == 1 ? [1] : [1, 2];
            const businessTypes = await BusinessTypeModel.find({
                status: { $in: status }
            }, {
                business_type_id: 1,
                business_type_name: 1,
                _id: 0,
            }).sort({ business_type_id: 1 });
            ResponseService.jsonResponse(200, businessTypes, res, null, "Business types retrieved successfully.");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, "Failed to retrieve business types.");
            return;
        }
    }

}