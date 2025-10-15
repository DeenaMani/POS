/**
 * Sales Controller
 * 
 * This module provides controller methods for CRUD operations on Sales.
 * It handles creating, retrieving, updating and deleting Sales.
 */

import { SalesModel, SalesItemsModel } from './sale.model';
import SalesPaymentsModel from '../SalesPayments/salePayments.model';
import { ResponseService } from '../../../Services/ResponseService';
import { ErrorService } from '../../../Services/ErrorService';
import CustomerModel from '../../Customer/customer.model';
import ProductModel from '../../Products/Product/product.model';
import { TaxSettingsModel } from '../../TaxSettings/taxSettings.model';
import { ValidationService } from '../../../Services/valdiationService';

export class Sales {

    /**
    * Lists all sales
    * 
    * @param req - Request object
    * @param res - Response object
    * 
    * @description
    * Retrieves all sales sorted by supplier_id and returns them in the response
    */

    public static async list(req: any, res: any) {
        try {
           
            const customerId = req.body?.customer_id;

            const searchTerm = req.body?.searchTerm;
            const page = req.body?.page || 1;
            const limit = req.body?.limit || 10;

            const filter: any = {
                
            };

            if (customerId) filter.customer_id = customerId;

            if (searchTerm) filter.$or = [
                { bill_number: { $regex: searchTerm, $options: 'i' } },
            ];

            let sortBy: any;
            switch (req.body?.sort_by) {
                case 1:
                    sortBy = { bill_number: -1 };
                    break;
                case 2:
                    sortBy = { bill_number: 1 };
                    break;
                case 3:
                    sortBy = { date: 1 };
                    break;
                case 4:
                    sortBy = { date: -1 };
                    break;
                case 5:
                    sortBy = { outstanding: -1 };
                    break;
                case 6:
                    sortBy = { paid: -1 };
                    break;
                default:
                    sortBy = { bill_number: -1 };
                    break;
            }

            // Retrieve filtered sales sorted by sale_id in ascending order
            const sales = await SalesModel.aggregate(
                [
                    {
                        $match: {
                            ...filter
                        }
                    },
                    {
                        $lookup: {
                            from: 'customers',
                            localField: 'customer_id',
                            foreignField: 'customer_id',
                            as: 'customer'
                        }
                    },
                    {
                        $unwind: {
                            path: '$customer',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $addFields: {
                            customer_name: '$customer.customer_name'
                        }
                    },
                    {
                        $project: {
                            customer: 0,
                        }
                    },
                    {
                        $sort: sortBy
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    },
                ]
            );

            // Return success response with -filtered sales
            const message = "All active sales retrieved successfully";

            ResponseService.jsonResponse(200, sales, res, req, message);
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
    * Creates a new sales
    * 
    * @param req - Request object containing sales data
    * @param res - Response object
    * 
    * @description
    * 1. Validates the incoming sales data
    * 2. Finds the last sales ID for the  to generate a new sequential ID
    * 3. Saves the new sales to the database
    * 4. Returns the created sales
    */

    public static async entry(req: any, res: any) {

        try {

            ValidationService.validateRequest(req, res);
           
            const customerId = req.body.customer_id;
            const paid_amount = Number(req.body?.paid_amount) || 0;
            if (typeof paid_amount !== 'number' || isNaN(paid_amount)) {
                ResponseService.jsonResponse(400, null, res, req, "Invalid paid amount: Paid amount must be a number");
                return;
            }
            if (!Number.isFinite(paid_amount)) {
                ResponseService.jsonResponse(400, null, res, req, "Invalid paid amount: Paid amount must be a finite number");
                return;
            }
            if (paid_amount < 0) {
                ResponseService.jsonResponse(400, null, res, req, "Invalid paid amount: Paid amount cannot be negative");
                return;
            }
            const customer = await CustomerModel.findOne({
                customer_id: customerId,
                
                status: { $in: [1] }
            });
            if (!customer) {
                ResponseService.jsonResponse(400, null, res, req, "Customer not found");
                return;
            }
            const products = req.body.products;
            if (!products || !Array.isArray(products) || products.length === 0) {
                ResponseService.jsonResponse(400, null, res, req, "Invalid products: Products array is required");
                return;
            }

            for (const product of products) {
                if (!product.product_id || !product.quantity || product.quantity <= 0) {
                    ResponseService.jsonResponse(400, null, res, req, "Invalid product: product_id and quantity are required");
                    return;
                }
            }

            const fetchProducts = await ProductModel.find({
                product_id: { $in: products.map((p: any) => p.product_id) },
                availability: 1,
                
                status: { $in: [1] }
            });

            if (fetchProducts.length !== products.length) {
                ResponseService.jsonResponse(400, null, res, req, "Some products not found or out of stock");
                return;
            }
            const tax_data = await TaxSettingsModel.find({
                tax_id: { $in: fetchProducts.map((p: any) => p.tax) },
                
                status: { $in: [1] }
            })

            let totalAmount = 0;
            let taxableAmount = 0;
            let salesItems: any[] = [];
            for (const product of fetchProducts) {
                const matchingProduct = products.find((p: any) => p.product_id === product.product_id);
                if (matchingProduct) {

                    const taxEntry = tax_data.find((t: any) => t.tax_id === product?.tax)?.tax as Object | Object[];

                    let taxpercentage = 0;
                    if (Array.isArray(taxEntry) && taxEntry[0] && typeof taxEntry[0] === 'object' && 'gst' in taxEntry[0]) {
                        taxpercentage = taxEntry[0]?.gst || 0;
                    } else if (taxEntry && typeof taxEntry === 'object' && 'gst' in taxEntry) {
                        taxpercentage = (taxEntry as { gst: number })?.gst || 0;
                    }
                    let taxAmount = (product.retailsales_price * matchingProduct.quantity * taxpercentage) / 100;

                    salesItems.push({
                        product_id: product.product_id,
                        
                        customer_id: customerId,
                        quantity: matchingProduct.quantity,
                        price_type: 'retail',
                        price: {
                            retail: product?.retailsales_price || 0,
                            wholesale: product?.wholesale_price || 0,
                            purchasesale: product?.purchasesale_price || 0,
                            mrp: product?.mrp || 0
                        },
                        tax: {
                            percentage: taxpercentage || 0,
                            amount: taxAmount
                        },
                        total: product.retailsales_price * matchingProduct.quantity,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });

                    totalAmount += product.retailsales_price * matchingProduct.quantity;
                    taxableAmount += taxAmount;
                }
            }
            const discount = req.body.discount || {
                percentage: 0,
                value: 0
            };

            const netTotal = (totalAmount + taxableAmount) - (discount?.percentage * totalAmount) / 100 || 0;

            /**
            * Generate a new customer ID based on the last customer ID for the 
            * This ensures unique sequential IDs for each customer
            */
            const lastcustomer = await SalesModel.findOne().sort({ bill_number: -1 });
            let lastcustomerId = lastcustomer?.bill_number || 'BNO0000';
            let numericSuffix = parseInt(lastcustomerId.substring(3), 10) || 0;
            let bill_number: string;
            let existingcustomer: any;
            const prefix = lastcustomerId.substring(0, 3);
            do {
                numericSuffix += 1;
                const paddedSuffix = numericSuffix.toString().padStart(4, '0');
                bill_number = prefix + paddedSuffix;
                existingcustomer = await SalesModel.findOne({  bill_number: bill_number });
            } while (existingcustomer);

            salesItems = salesItems.map((item: any) => ({
                ...item,
                bill_number: bill_number
            }));

            const saleData = {
                
                bill_number: bill_number,
                bill_date: req.body.bill_date || new Date(),
                customer_id: customerId,
                total: Number(totalAmount).toFixed(2),
                tax: Number(taxableAmount).toFixed(2),
                discount: discount,
                net_total: Number(netTotal).toFixed(2),
                paid: Number(paid_amount || 0).toFixed(2),
                remarks: req.body.remarks || '',
                outstanding: Number(netTotal - (paid_amount || 0)).toFixed(2),
                created_at: new Date(),
                updated_at: new Date(),
            };

            const payment_data = {
                
                bill_number: bill_number,
                customer_id: customerId,
                payment_date: req.body.payment_date || new Date(),
                payment_method: req.body.payment_method || 'cash',
                payment_amount: Number(paid_amount || 0).toFixed(2),
                created_at: new Date(),
                updated_at: new Date(),
            };

            const updateCustomer = {
                $set: {
                    total_amount: Number((customer?.total_amount ?? 0) + netTotal).toFixed(2),
                    total_paid: Number((customer?.total_paid ?? 0) + (paid_amount || 0)).toFixed(2),
                    total_due: Number((customer?.total_due ?? 0) + (netTotal - (paid_amount || 0))).toFixed(2),
                    updated_at: new Date()
                }
            }
            console.log("Sale Data: ", (customer?.total_paid ?? 0) + (paid_amount || 0));
            const sale = await SalesModel.create(saleData);
            if (!sale) {
                ResponseService.jsonResponse(400, null, res, req, "Failed to record sale");
                return;
            }
            const saleItemRecord = await SalesItemsModel.insertMany(salesItems);
            if (!saleItemRecord || saleItemRecord.length !== salesItems.length) {
                const saleDeleteResult = await SalesModel.deleteOne({ bill_number: bill_number });
                const itemsDeleteResult = await SalesItemsModel.deleteMany({ bill_number: bill_number });
                if (saleDeleteResult.deletedCount === 0 || itemsDeleteResult.deletedCount === 0) {
                    ResponseService.jsonResponse(500, null, res, req, "Failed to delete sale or sale items during rollback", false);
                    return;
                }
                ResponseService.jsonResponse(400, null, res, req, "Failed to record sale items" + JSON.stringify({ saleItemRecordLength: saleItemRecord.length, salesItemsLength: salesItems.length }), false);
                return;
            }

            // Update product stock for each product individually (no bulkWrite)
            for (const product of fetchProducts) {
                const saleItem = salesItems.find(item => item.product_id === product.product_id);
                if (saleItem) {
                    const newQty = Number((product.opening_stock_qty || 0) - Number(saleItem.quantity || 0)).toFixed(2);
                    await ProductModel.updateOne(
                        { product_id: product.product_id },
                        { $set: { opening_stock_qty: newQty } }
                    );
                }
            }

            if (req.body?.paid_amount && req.body?.paid_amount > 0) {
                const payment = await SalesPaymentsModel.insertOne(payment_data);
                if (!payment) {
                    const saleDeleteResult = await SalesModel.deleteOne({ bill_number: bill_number });
                    const itemsDeleteResult = await SalesItemsModel.deleteMany({ bill_number: bill_number });
                    await SalesPaymentsModel.deleteMany({ bill_number: bill_number });
                    if (saleDeleteResult.deletedCount === 0 || itemsDeleteResult.deletedCount === 0) {
                        ResponseService.jsonResponse(500, null, res, req, "Failed to delete sale or sale items during rollback", false);
                        return;
                    }
                    ResponseService.jsonResponse(400, null, res, req, "Failed to record payment" + JSON.stringify(payment), false);
                    return;
                }
            }

            const customerUpdate = await CustomerModel.updateOne({ customer_id: customerId }, updateCustomer);
            if (!customerUpdate || customerUpdate.modifiedCount === 0) {
                const saleDeleteResult = await SalesModel.deleteOne({ bill_number: bill_number });
                const itemsDeleteResult = await SalesItemsModel.deleteMany({ bill_number: bill_number });
                const paymentsDeleteResult = await SalesPaymentsModel.deleteOne({ bill_number: bill_number });
                if (saleDeleteResult.deletedCount === 0 || itemsDeleteResult.deletedCount === 0 || (req.body.paid_amount && paymentsDeleteResult.deletedCount === 0)) {
                    ResponseService.jsonResponse(500, null, res, req, "Failed to delete sale or sale items during rollback", false);
                    return;
                }
                ResponseService.jsonResponse(400, null, res, req, "Failed to update customer" + JSON.stringify(customerUpdate), false);
                return;
            }

            ResponseService.jsonResponse(201, sale, res, null, "Sale recorded successfully");
        } catch (error: any) {
            ErrorService.handleError(error, res, req);
        }
    }


    /**
    * Retrieves a specific sales by ID
    * 
    * @param req - Request object containing sales ID in params
    * @param res - Response object
    * 
    * @description
    * 1. Extracts the sales ID from request params
    * 2. Validates that an ID was provided
    * 3. Finds the sales by ID
    * 4. Returns the sales or a not found response
    */

    public static async view(req: any, res: any) {
        try {
            const billNo = req.params.id;
           

            const sale = await SalesModel.findOne({
                bill_number: billNo,
                
            }, { created_at: 0, updated_at: 0, __v: 0, _id: 0});
            if (!sale) {
                ResponseService.jsonResponse(404, null, res, req, "Sale not found");
                return;
            }
            const customer =
                sale?.customer_id
                    ? await CustomerModel.findOne({ customer_id: sale.customer_id })
                    : null;
            const saleObj = sale.toObject ? sale.toObject() : { ...sale };
            (saleObj as any).customer_name = customer ? customer.customer_name : null;

            const saleItems = await SalesItemsModel.aggregate([
                {
                    $match: {
                        bill_number: billNo,
                        
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product_id',
                        foreignField: 'product_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: {
                        path: '$product',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        product_name: '$product.product_name',
                        product_price: '$product.retail',
                    }
                },
                {
                    $project: {
                        product: 0,
                        // bill_number: 1,
                        // product_id: 1,
                        // product_name: 1,
                        // product_price: 1,
                        // quantity: 1,
                        // total: 1,
                    }
                }
            ]);

            ResponseService.jsonResponse(200, { saleObj, saleItems }, res, null, "Sale fetched successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
    * Retrieves a specific sales by ID
    * 
    * @param req - Request object containing sales ID in params
    * @param res - Response object
    * 
    * @description
    * 1. Extracts the sales ID from request params
    * 2. Validates that an ID was provided
    * 3. Finds the sales by ID
    * 4. Returns the sales or a not found response
    */

    public static async edit(req: any, res: any) {
        try {
            const billNo = req.params.id;
           

            const sale = await SalesModel.findOne({
                bill_number: billNo,
                
            });

            ResponseService.jsonResponse(200, sale, res, null, "Sale fetched successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
         * Updates a specific sales
         * 
         * @param req - Request object containing sales ID in params and update data in body
         * @param res - Response object
         * 
         * @description
         * 1. Extracts the sales ID and validates it
         * 2. Finds the sales to update
         * 3. Updates the sales with new data while preserving existing values for unspecified fields
         * 4. Returns the updated sales
         */
    public static async update(req: any, res: any) {
        try {
            const saleId = req.params.id || req.body.sale_id || req.query.sale_id;

            if (!saleId) {
                return res.status(400).json({
                    success: false,
                    message: "Sale ID is required"
                });
            }
            // Prepare update data, do not allow changing IDs or created_at
            const updateData = { ...req.body };
            delete updateData.sale_id;
            delete updateData.created_at;

            updateData.updated_at = new Date();

            const sale = await SalesModel.findOneAndUpdate(
                { sale_id: saleId },
                updateData,
                { new: true, runValidators: true }
            );

            if (!sale) {
                return res.status(404).json({
                    success: false,
                    message: "Sale not found"
                });
            }

            ResponseService.jsonResponse(200, sale, res, req, "Sale updated successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
        * Deletes a specific sales
        * 
        * @param req - Request object containing sales ID in params
        * @param res - Response object
        * 
        * @description
        * 1. Extracts the sales ID and validates it
        * 2. Finds the sales to delete
        * 3. Checks if any products are using this sales
        * 4. Deletes the sales if not in use
        */

    public static async delete(req: any, res: any) {
        try {
            const saleId = req.params.id;
           

            // Validate that sale ID was provided
            if (!saleId) {
                return res.status(400).json({
                    success: false,
                    message: "Sale ID is required"
                });
            }

            // Validate that  ID is provided
          

            // Find the sale to soft delete by ID and 
            const sale = await SalesModel.findOne({
                sale_id: saleId,
               
            });

            // Return 404 if sale not found
            if (!sale) {
                return res.status(404).json({
                    success: false,
                    message: "Sale not found for this "
                });
            }

            // Soft delete the sale by updating status to 0 (inactive)
            const updatedSale = await SalesModel.findOneAndUpdate(
                {
                    sale_id: saleId,
                },
                {
                    status: 0,
                    updated_at: new Date()
                },
                { new: true }
            );

            ResponseService.jsonResponse(200, updatedSale, res, req, "Sale deactivated successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

}