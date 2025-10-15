import PrefixSettingsModel from "./prefixSettings.model";
import { ErrorService } from "../../../Services/ErrorService";
import { ResponseService } from "../../../Services/ResponseService";
import userModel from "../Users/user.model";
import { SalesModel } from "../../Sales/Sales/sale.model";
import { Purchase } from "../../Purchases/Purchases/purchase.model";
import SupplierModel from "../../Supliers/supplier.model";
import CustomerModel from "../../Customer/customer.model";
import ProductModel from "../../Products/Product/product.model";

export default class PrefixSettings {
    /**
     * @description List all prefix settings.
     */
    public static async list(req: any, res: any) {
        try {
            const settings = await PrefixSettingsModel.find();
            ResponseService.jsonResponse(200, settings, res, null, "Prefix settings retrieved successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
     * @description Create new prefix settings.
     */
    public static async create(req: any, res: any) {
        try {
            const data = {
                
                users_prefix: req.body?.users_prefix || "",
                product_prefix: req.body?.product_prefix || "",
                invoice_prefix: req.body?.invoice_prefix || "",
                estimate_prefix: req.body?.estimate_prefix || "",
                sales_prefix: req.body?.sales_prefix || "",
                supplier_prefix: req.body?.supplier_prefix || "",
                customer_prefix: req.body?.customer_prefix || ""
            };

            try {
                /* Validate the data before saving */
                await PrefixSettingsModel.validate(data);
            } catch (validationError) {
                ErrorService.handleError(validationError, res, req);
                return;
            }

            const newSettings = new PrefixSettingsModel(data);
            await newSettings.save();
            ResponseService.jsonResponse(201, newSettings, res, null, "Prefix settings created successfully");
        } catch (error: any) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
     * @description Fetch prefix settings by ID for editing.
     */
    public static async edit(req: any, res: any) {
        try {
            const settings = await PrefixSettingsModel.findOne();
            if (!settings) {
                this.create(req, res);
                return; /* If not found, create new settings instead */
            }
            ResponseService.jsonResponse(200, settings, res, null, "Prefix settings retrieved successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
     * @description Update existing prefix settings by ID.
     */
    public static async update(req: any, res: any) {
        try {
            const settings = await PrefixSettingsModel.findOne();
            if (!settings) {
                ResponseService.jsonResponse(404, null, res, null, "Prefix settings not found.");
                return;
            }

            const user = await userModel.findOne();
            const userPrefix = user ? req.body?.users_prefix ?? "" : "";

            const sale = await SalesModel.findOne();
            const salePrefix = sale ? req.body?.sales_prefix ?? "" : "";

            const purchase = await Purchase.findOne();
            const purchasePrefix = purchase ? req.body?.purchase_prefix ?? "" : "";

            const product = await ProductModel.findOne();
            const productPrefix = product ? req.body?.product_prefix ?? "" : "";

            const supplier = await SupplierModel.findOne();
            const supplierPrefix = supplier ? req.body?.supplier_prefix ?? "" : "";

            const customer = await CustomerModel.findOne();
            const customerPrefix = customer ? req.body?.customer_prefix ?? "" : "";

            const data = {
                'users_prefix': userPrefix,
                'estimate_prefix': req.body?.estimate_prefix || settings?.estimate_prefix || "",
                'product_prefix': productPrefix,
                'invoice_prefix': purchasePrefix,
                'sales_prefix': salePrefix,
                'supplier_prefix': supplierPrefix,
                'customer_prefix': customerPrefix
            };

            /* Find the settings by  and update */
            const updatedSettings = await PrefixSettingsModel.findOneAndUpdate(
                data,
                { new: true }
            );
            if (!updatedSettings) {
                ResponseService.jsonResponse(404, null, res, null, "Prefix settings not found.");
                return;
            }
            ResponseService.jsonResponse(200, updatedSettings, res, null, "Prefix settings updated successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * @description Delete prefix settings by ID.
     */
    public static async delete(req: any, res: any) {
        try {
            const deletedSettings = await PrefixSettingsModel.findOneAndDelete();
            if (!deletedSettings) {
                return ResponseService.jsonResponse(404, null, res, null, "Prefix settings not found.");
            }
            ResponseService.jsonResponse(200, deletedSettings, res, null, "Prefix settings deleted successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }
}