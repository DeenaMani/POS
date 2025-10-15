import { Router } from "express";
import DashboardController from "./dashboard.controller";


const dashboardRoutes = Router();

/**
 * Dashboard Management Module
 * Handles operations such as fetching dashboard data.
 */

/**
 * Fetch dashboard data for the .
 * @route GET /dashboard
 * @returns {object} Dashboard data including total sales, today sales, products, today invoices, total purchase orders, today purchase orders etc.
 */
dashboardRoutes.get("/", DashboardController.getDashboardData);

/**
 * Fetch sales and purchase data for the .
    * @route GET /dashboard/sales-purchase
 */
dashboardRoutes.get("/sales-purchase", DashboardController.getSalesPurchaseData);

/**
 * Fetch recent sales invoices for the .
 * @route GET /dashboard/recent-sales-invoices
 * @returns {object} List of recent sales invoices.
 */
dashboardRoutes.get("/recent-sales-invoices", DashboardController.getRecentSalesInvoices);
/**
 * Fetch get stock movements for the .
 * @route GET /dashboard/get-stock-movements
 * @returns {object} List of stock movements.
 */
dashboardRoutes.get("/get-stock-movements", DashboardController.getStockMovements);


export default dashboardRoutes;