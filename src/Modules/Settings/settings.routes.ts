import { Router } from "express";
import userRouter from "./Users/user.routes";
import roleRouter from "./Roles/role.routes";
import businessSettingsRouter from "./BusinessSettings/businessSettings.routes";
import prefixSettingsRouter from "./PrefixsSettings/prefixSettings.routes";
import generalSettingsRouter from "./GeneralSettings/generalSettings.routes";
import BusinessTypeController from "../BusinessType/businesstype.controller";
import taxSettingsRoutes from "../TaxSettings/taxSettings.routes";

const settingsRoutes = Router();

/**
 * Handles user management, preferences, and other settings-related operations.
 */
settingsRoutes.use("/business-settings", businessSettingsRouter);

/**
 * Handles business type management, preferences, and other settings-related operations.
 */
settingsRoutes.get("/business-types/list", BusinessTypeController.list);

/**
 * Handles user management, preferences, and other settings-related operations.
 */
settingsRoutes.use("/prefixs", prefixSettingsRouter);

/**
 * Handles general settings management, preferences, and other settings-related operations.
 */
settingsRoutes.use("/general-settings", generalSettingsRouter);

/**
 * Handles tax settings management, preferences, and other settings-related operations.
 * @deprecated Use the new tax settings module instead.
 */
settingsRoutes.use("/tax-settings", taxSettingsRoutes);
/**
 * Handles user management, preferences, and other settings-related operations.
 */
settingsRoutes.use("/users", userRouter);

/**
 * Handles Role management, preferences, and other settings-related operations.
 */
settingsRoutes.use("/roles", roleRouter);

export default settingsRoutes;