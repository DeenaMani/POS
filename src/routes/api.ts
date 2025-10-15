import { Router } from "express";
import AuthCheck from "../Middleware/authencation";
import requestCheck from "../Middleware/verifyApiRequest";
import productsRoute from "../Modules//Products/products.routes";
import supplierRoutes from "../Modules//Supliers/supplier.routes";
import authRouter from "../Modules//Authencation/authentication.routes";
import customerRoutes from "../Modules//Customer/customer.routes";
import saleRoutes from "../Modules//Sales/sales.routes";
import purchaseRoutes from "../Modules//Purchases/purchase.routes";
import dashboardRoutes from "../Modules//Dashboard/dashboard.routes";
import locationRoutes from "../Modules/Location/location.routes";
import settingsRoutes from "../Modules//Settings/settings.routes";


const apiRoutes = Router();
apiRoutes.use(requestCheck);

/**
 * Authentication Module Routes
 * This module handles user authentication functionalities.
 * It includes user registration, login, and other authentication-related operations.
 */

apiRoutes.use("/", authRouter);


/**
 * Dashboard Module Routes
 * This module handles dashboard-related functionalities.
 * It includes fetching dashboard data, sales and purchase statistics, and other dashboard-related operations.
 */
apiRoutes.use('/dashboard', AuthCheck, dashboardRoutes);


/**
 * Location Module Routes
 * This module handles location-related functionalities.
 * It includes fetching countries, states, and cities for location management.
 */
apiRoutes.use('/locations/', AuthCheck, locationRoutes)

/**
 * Setting Module Routes
 * This module handles user settings and related functionalities.  
 * It includes user management, preferences, and other settings-related operations.
 */
apiRoutes.use('/settings', AuthCheck,settingsRoutes);

/**
 * Products Module Routes
 * This module manages product-related functionalities.
 * It includes product creation, listing, and other product management operations.
 */
apiRoutes.use('/products', AuthCheck, productsRoute);

/**
 * Suppliers Module Routes
 * This module manages supplier-related functionalities.
 * It includes supplier creation, listing, and other supplier management operations.
 */
apiRoutes.use('/suppliers', AuthCheck, supplierRoutes);

/**
 * Clients Module Routes
 * This module manages clients-related functionalities.
 * It includes client creation, listing, and other client management operations.
 */
apiRoutes.use('/customer', AuthCheck, customerRoutes);

/**
 * Sales Module Routes
 * This module manages Sales-related functionalities.
 * It includes sales creation, listing, and other sales management operations.
 */
apiRoutes.use('/sales', AuthCheck, saleRoutes);

/**
 * Purchase Module Routes
 * This module manages Purchase-related functionalities.
 * It includes purchases creation, listing, and other purchases management operations.
 */
apiRoutes.use('/purchase', AuthCheck, purchaseRoutes);

export default apiRoutes;