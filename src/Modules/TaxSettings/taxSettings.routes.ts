import { Router } from "express";
import TaxSettingsController from "./taxSettings.controller";

const taxSettingsRoutes = Router();

/**
 * Tax Settings Management Module
 * Handles operations such as fetching tax settings data.
 */

/**
 * Fetch all tax settings.
 * @route GET /tax-settings
 * @returns {object} List of tax settings.
 */
taxSettingsRoutes.get("/list", TaxSettingsController.list);

/**
 * Fetch GST state codes.
 * @route GET /tax-settings/gst-state-codes-list
 * @returns {object} List of GST state codes.
 */
taxSettingsRoutes.get("/gst-state-code-list", TaxSettingsController.gstCodeList);


export default taxSettingsRoutes;