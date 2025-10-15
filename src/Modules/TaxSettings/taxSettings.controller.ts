import { ErrorService } from "../../Services/ErrorService";
import { ResponseService } from "../../Services/ResponseService";
import { TaxSettingsModel, GstStateCodeModel } from "./taxSettings.model";


export default class TaxSettingsController {
    /**
     * @description This method retrieves all tax settings from the database.
     */
    public static async list(req: any, res: any) {
        try {
            const status = req.body?.list_type == 0 ? [1, 2] : [1];
            const taxSettings = await TaxSettingsModel.find({
                status: { $in: status }
            }, {
                tax_id: 1,
                tax: 1,
                _id: 0,
            }).sort({ tax_id: 1 });
            ResponseService.jsonResponse(200, taxSettings, res, null, "Tax settings retrieved successfully.");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, "Failed to retrieve tax settings.");
            return;
        }
    }

    public static async gstCodeList(req: any, res: any) {
        try {
            const gstCodes = await GstStateCodeModel.find({}, {
                id: 1,
                code: 1,
                _id: 0,
            }).sort({ id: 1 });
            ResponseService.jsonResponse(200, gstCodes, res, null, "GST codes retrieved successfully.");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, "Failed to retrieve GST codes.");
            return;
        }
    }

}