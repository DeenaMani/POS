import GeneralSettingsModel from "./generalSettings.model";
import { ErrorService } from "../../../Services/ErrorService";
import { ResponseService } from "../../../Services/ResponseService";

export default class GeneralSettings {
    /**
     * @description List all general settings.
     */
    public static async list(req: any, res: any) {
        try {
            const settings = await GeneralSettingsModel.find();
            ResponseService.jsonResponse(200, settings, res, null, "General settings retrieved successfully.");
            return;
        } catch (error) {
            ResponseService.jsonResponse(500, null, res, error, "Failed to retrieve general settings.");
            return;
        }
    }

    /**
     * @description Create new general settings.
     */
    public static async create(req: any, res: any) {
        try {
            const data = {
                
                product_search: req.body?.product_search || 1,
                customer_reward_point: req.body?.customer_reward_point || 0,
                negative_quantity: req.body?.negative_quantity || 0,
                sales_type: req.body?.sales_type || 0,
                sales_rate: req.body?.sales_rate || 0,
                show_on_mrp: req.body?.show_on_mrp || 1,
                expire_date: req.body?.expire_date || 1,
                customer_reward_point_card: req.body?.customer_reward_point_card || 0,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const newSettings = new GeneralSettingsModel(data);
            await newSettings.save();
            ResponseService.jsonResponse(201, newSettings, res, null, "General settings created successfully.");
            return;
        } catch (error: any) {
            ResponseService.jsonResponse(500, null, res, error, "Failed to create general settings.");
            return;
        }
    }

    /**
     * @description Fetch general settings by ID for editing.
     */
    public static async edit(req: any, res: any) {
        try {
            const settings = await GeneralSettingsModel.findOne();
            if (!settings) {
                /* ResponseService.jsonResponse(404, null, res, null, "General settings not found.");
                return; */
                this.create(req, res);
                return; /* If not found, create new settings instead */
            }
            ResponseService.jsonResponse(200, settings, res, null, "General settings retrieved successfully.");
            return;
        } catch (error) {
            ResponseService.jsonResponse(500, null, res, error, "Failed to retrieve general settings.");
            return;
        }
    }

    /**
     * @description Update existing general settings by ID.
     */
    public static async update(req: any, res: any) {
        try {

            const settings = await GeneralSettingsModel.findOne();
            if (!settings) {
                return ErrorService.handleError(new Error("General settings not found."), res, req);
            }
            const data = {
                product_search: req.body?.product_search,
                customer_reward_point: req.body?.customer_reward_point,
                customer_reward_point_card: req.body?.customer_reward_point_card,
                negative_quantity: req.body?.negative_quantity,
                sales_type: req.body?.sales_type,
                sales_rate: req.body?.sales_rate,
                show_on_mrp: req.body?.show_on_mrp,
                expire_date: req.body?.expire_date,
                updated_at: new Date(),
            };
            /*    Validate the data before updating */
            try {
                await GeneralSettingsModel.validate(data);
            } catch (validationError) {
                ErrorService.handleError(validationError, res, req);
                return;
            }

            const updatedSettings = await GeneralSettingsModel.findOneAndUpdate(
                data,
                { new: true }
            );
            if (!updatedSettings) {
                ErrorService.handleError(new Error("General settings not found."), res, req);
                return;
            }
            ResponseService.jsonResponse(200, updatedSettings, res, req, "General settings updated successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * @description Delete general settings by ID.
     */
    public static async delete(req: any, res: any) {
        try {
            const deletedSettings = await GeneralSettingsModel.findOneAndDelete();
            if (!deletedSettings) {
                return ErrorService.handleError(new Error("General settings not found."), res, req);
            }
            ResponseService.jsonResponse(200, deletedSettings, res, null, "General settings deleted successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }
}
