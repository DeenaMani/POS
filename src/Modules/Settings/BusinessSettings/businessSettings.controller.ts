import BusinessSettingsModel from "./businessSettings.model";
import { ErrorService } from "../../../Services/ErrorService";
import { ResponseService } from "../../../Services/ResponseService";
/**
 * @description Business Settings controller for managing  business settings.
 * Provides methods to list, create, edit, update, and delete business settings.
 */
export default class BusinessSettings {
    /**
     * @description List all business settings.
     */
    public static async list(req: { body: any; }, res: any) {
        try {
            const settings = await BusinessSettingsModel.find();
            ResponseService.jsonResponse(200, settings, res, null, "Business settings retrieved successfully.", true);
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }
    /**
     * @description Create a new business setting.
     */
    public static async create(req: any, res: any, data: any = null) {
        try {

            let file: any;
            if (req.files) {
                if (Array.isArray(req.files)) {
                    file = req.files.find((f: any) => f.fieldname === 'business_logo');
                } else {
                    /*  If req.files is an object, access by fieldName */
                    file = (req.files as { [fieldname: string]: any })['business_logo'];
                }
            }
            /* Prepare data from request body */
            const data = {
                business_type: req.body?.business_type || '1', /*  Default to '1' if not provided */
                business_name: req.body?.business_name || '',
                email: req.body?.email || '',
                mobile_number: req.body?.mobile_number || '',
                joined_date: req.body?.joined_date || new Date(),
                country: req.body?.country || '',
                state: req.body?.state || '',
                city: req.body?.city || '',
                zip_code: req.body?.zip_code || '',
                address_lane1: req.body?.address_lane1 || '',
                address_lane2: req.body?.address_lane2 || '',
                state_code: req.body?.state_code || '',
                currency: req.body?.currency || '',
                financial_year_from: req.body?.financial_year_from || '',
                financial_year_to: req.body?.financial_year_to || '',
                website: req.body?.website || '',
                business_logo: file ? file.originalname : '', /*  Use file name if uploaded */
            };
            try {
                await BusinessSettingsModel.validate(data);
            } catch (validationError) {
                ErrorService.handleError(validationError, res, req);
                return
            }

            /* Handle optional business_logo (file upload) */
            let business_logo = '';
            if (req.files && req.files.business_logo) {
                const file = Array.isArray(req.files.business_logo)
                    ? req.files.business_logo[0]
                    : req.files.business_logo;
                business_logo = file.originalname;
                /* You may want to save the file to disk here */
            }

            const newSettings = new BusinessSettingsModel(data);

            await newSettings.save();
            ResponseService.jsonResponse(201, newSettings, res, null, "Business settings created successfully.", true);
            return;

        } catch (error: any) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }
    /**
     * @description Fetch business setting by ID for editing.
     */
    public static async edit(req: { params: { id: string; }; }, res: any) {
        try {
            const settings = await BusinessSettingsModel.findOne();
            if (!settings) {
                ResponseService.jsonResponse(404, null, res, null, "Business settings not found.", false);
                return;
            }
            ResponseService.jsonResponse(200, settings, res, null, "Business settings retrieved successfully.", true);
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
     * @description Update an existing business setting by ID.
     */
    public static async update(req: any, res: any) {
        try {
            const settings = await BusinessSettingsModel.findOne();
            let file: any;
            if (req.files) {
                if (Array.isArray(req.files)) {
                    file = req.files.find((f: any) => f.fieldname === 'business_logo');
                } else {
                    /*  If req.files is an object, access by fieldName */
                    file = (req.files as { [fieldname: string]: any })['business_logo'];
                }
            }

            /* Prepare data from request body */
            const data = {
                business_type: req.body?.business_type || '1', /*  Default to '1' if not provided */
                business_name: req.body?.business_name || settings?.business_name,
                email: req.body?.email || settings?.email,
                mobile_number: req.body?.mobile_number || settings?.mobile_number,
                country: req.body?.country || settings?.country,
                state: req.body?.state || settings?.state,
                city: req.body?.city || settings?.city,
                zip_code: req.body?.zip_code || settings?.zip_code,
                address_lane1: req.body?.address_line1 || settings?.address_lane1,
                address_lane2: req.body?.address_line2 || settings?.address_lane2,
                state_code: req.body?.state_code || settings?.state_code,
                currency: req.body?.currency || settings?.currency,
                financial_year_from: req.body?.financial_year_from || settings?.financial_year_from,
                financial_year_to: req.body?.financial_year_to || settings?.financial_year_to,
                website: req.body?.website || settings?.website,
                business_logo: file ? file.originalname : '', /*  Use file name if uploaded */
            };

            try {
                await BusinessSettingsModel.validate(data);
            } catch (validationError) {
                ErrorService.handleError(validationError, res, req);
                return
            }

            /* Handle optional business_logo (file upload) */
            let business_logo = '';
            if (req.files && req.files.business_logo) {
                const file = Array.isArray(req.files.business_logo)
                    ? req.files.business_logo[0]
                    : req.files.business_logo;
                business_logo = file.originalname;
                /* You may want to save the file to disk here */
            }

            const updatedSettings = await BusinessSettingsModel.findOneAndUpdate(data, { new: true });
            if (!updatedSettings) {
                return ResponseService.jsonResponse(404, null, res, null, "Business settings not found.", false);
            }
            ResponseService.jsonResponse(200, updatedSettings, res, null, "Business settings updated successfully.", true);
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }
    /**
     * @description Delete a business setting by ID.
     */
    public static async delete(req: { params: { id: string; }; }, res: any) {
        try {
            const deletedSettings = await BusinessSettingsModel.findOneAndDelete();
            if (!deletedSettings) {
                ResponseService.jsonResponse(404, null, res, null, "Business settings not found.", false);
                return;
            }
            ResponseService.jsonResponse(204, null, res, null, "Business settings deleted successfully.", true);
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }
}