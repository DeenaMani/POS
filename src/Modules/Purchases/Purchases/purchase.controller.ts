import { Purchase } from './purchase.model';
import { PurchaseItems } from './purchase.items.model';
import { PurchasePayments } from '../PurchasePayments/purchase.payments.model';
import ProductModel from '../../Products/Product/product.model';
import { ResponseService } from '../../../Services/ResponseService';
import { ErrorService } from '../../../Services/ErrorService';
import SupplierModel from '../../Supliers/supplier.model';
import { TaxSettingsModel } from '../../TaxSettings/taxSettings.model';

export class PurchaseController {

    /**
     * List all purchases for a  with supplier details.
     * Aggregates purchase data, joins with suppliers collection,
     * and includes pagination support.
     */
    public static async list(req: any, res: any) {
        try {
            
           

            const supplierId = req.body?.supplier_id;
            // Safely access request properties with optional chaining and defaults
            const searchTerm = req.body?.search || req.query?.search || '';
            const limit = parseInt(req.body?.limit || req.query?.limit || '100', 10);
            const page = parseInt(req.body?.page || req.query?.page || '1', 10);

            // Get specific filters from request
            const purchaseId = req.body?.invoice_number || req.query?.invoice_number || '';
            const supplierName = req.body?.supplier_name || req.query?.supplier_name || '';
            const paymentStatus = req.body?.payment_status !== undefined ? req.body.payment_status :
                req.query?.payment_status !== undefined ? req.query.payment_status : null;
            const startDate = req.body?.start_date || req.query?.start_date || '';
            const endDate = req.body?.end_date || req.query?.end_date || '';

            // Create base filter without search conditions
            const filter: any = {
                
            };

            if (supplierId) filter.supplier_id = supplierId;
            // Add specific ID filter if provided
            if (purchaseId && purchaseId.trim() !== '') {
                filter.invoice_number = { $regex: purchaseId, $options: 'i' };
            }


            // Add payment status filter if provided
            if (paymentStatus !== null && paymentStatus !== '') {
                filter.payment_status = parseInt(paymentStatus, 10);
            }

            // Add date range filter if provided
            if (startDate && endDate) {
                filter.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            } else if (startDate) {
                filter.date = { $gte: new Date(startDate) };
            } else if (endDate) {
                filter.date = { $lte: new Date(endDate) };
            }

            /*  Execute aggregation pipeline */
            const pipeline: any[] = [
                { $match: filter },
                {
                    $lookup: {
                        from: 'suppliers',
                        localField: 'supplier_id',
                        foreignField: 'supplier_id',
                        as: 'supplier_info'
                    }
                },
                {
                    $unwind: {
                        path: '$supplier_info',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        supplier_name: '$supplier_info.business_name',
                    }
                }
            ];

            // Filter by supplier name after lookup (if provided or as part of general search)
            if ((supplierName && supplierName.trim() !== '') || (searchTerm && searchTerm.trim() !== '')) {
                let orConditions = [];

                // Add supplier name specific filter
                if (supplierName && supplierName.trim() !== '') {
                    orConditions.push({ supplier_name: { $regex: supplierName, $options: 'i' } });
                }

                // Add general search conditions
                if (searchTerm && searchTerm.trim() !== '') {
                    orConditions.push({ invoice_number: { $regex: searchTerm, $options: 'i' } });
                    orConditions.push({ supplier_name: { $regex: searchTerm, $options: 'i' } });
                }

                pipeline.push({
                    $match: { $or: orConditions }
                });
            }

            // Add remaining pipeline stages
            pipeline.push(
                {
                    $project: {
                        _id: 1,
                        invoice_number: 1,
                        supplier_id: 1,
                        supplier_name: 1,
                        total: 1,
                        discount: 1,
                        tax: 1,
                        net_amount: 1,
                        remarks: 1,
                        handled_by: 1,
                        paid: 1,
                        outstanding: 1,
                        invoice_date: 1,
                        payment_status: 1,
                        status: 1,
                        created_at: 1,
                        updated_at: 1,
                        purchase_items: 1
                    }
                },
                {
                    $sort: { invoice_date: -1, invoice_number: -1 }
                },
                { $skip: (page - 1) * limit },
                { $limit: limit }
            );

            // Execute the pipeline
            const purchases = await Purchase.aggregate(pipeline);
            /* Send response with pagination metadata */
            ResponseService.jsonResponse(
                200,
                {
                    purchases,

                },
                res,
                req,
                "Purchases retrieved successfully"
            );
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }
    /**
     * Creates a new purchase with purchase history entries
     * 
     * @param req - Request object containing purchase data
     * @param res - Response object
     * 
     * @description
     * 1. Validates the purchase data
     * 2. Generates a -specific purchase ID
     * 3. Creates the purchase record
     * 4. Creates purchase history records for each product
     * 5. Updates product stock quantities
     * 6. Returns the created purchase with history
     */
    public static async create(req: any, res: any) {
        try {
           
            const userId = req.headers['user_id'];

            const supplierId = req.body.supplier_id;
            const supplier = await SupplierModel.findOne({
                supplier_id: supplierId,
                
                status: { $in: [1] }
            });
            if (!supplier) {
                ResponseService.jsonResponse(400, null, res, req, "Supplier not found");
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
            });

            // Generate purchase ID
            const lastPurchase = await Purchase.findOne().sort({ invoice_number: -1 });
            let lastPurchaseId = lastPurchase?.invoice_number || 'INV0000';
            let numericSuffix = parseInt(lastPurchaseId.substring(3), 10) || 0;
            let purchaseId: string;
            let existingPurchase: any;
            const prefix = lastPurchaseId.substring(0, 3);

            do {
                numericSuffix += 1;
                const paddedSuffix = numericSuffix.toString().padStart(4, '0');
                purchaseId = prefix + paddedSuffix;
                existingPurchase = await Purchase.findOne({
                    
                    invoice_number: purchaseId
                });
            } while (existingPurchase);

            let totalAmount = 0;
            let taxableAmount = 0;
            let purchaseItems: any[] = [];

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

                    purchaseItems.push({
                        
                        invoice_number: purchaseId,
                        supplier_id: supplierId,
                        product_id: product.product_id,
                        tax: {
                            percentage: taxpercentage || 0,
                            amount: taxAmount
                        },
                        unit: product.unit,
                        quantity: matchingProduct.quantity,
                        amount: {
                            retail: product?.retailsales_price || 0,
                            wholesale: product?.wholesale_price || 0,
                            purchasesale: product?.purchasesale_price || 0,
                            mrp: product?.mrp || 0
                        },
                        total_amount: product.retailsales_price * matchingProduct.quantity,
                        hsn_sac_code: product.hsn_sac_code || '',
                        gst_percentage: taxpercentage || 0,
                        status: 1,
                        created_at: new Date(),
                        updated_at: new Date()
                    });

                    totalAmount += product.retailsales_price * matchingProduct.quantity;
                    taxableAmount += taxAmount;
                }
            }

            const discount = req.body.discount ||
            {
                percentage: 0,
                amount: 0
            }
                ;

            const netTotal = (totalAmount + taxableAmount) - (discount?.percentage * totalAmount) / 100 || 0;

            const purchaseData = {
                invoice_number: purchaseId,
                
                supplier_id: supplierId,
                total: Number(totalAmount).toFixed(2),
                discount: {
                    percentage: Number(discount?.percentage || 0).toFixed(2),
                    amount: Number(discount?.amount || 0).toFixed(2)
                },
                tax: Number(taxableAmount).toFixed(2),
                net_amount: Number(netTotal).toFixed(2),
                paid: Number(req.body?.paid_amount || 0).toFixed(2),
                outstanding: Number(netTotal - (req.body?.paid_amount || 0)).toFixed(2),
                remarks: req.body.remarks || '',
                invoice_date: req.body.invoice_date || new Date(),
                handled_by: userId,
                status: 1,
                payment_status: 0,
                created_at: new Date(),
                updated_at: new Date()
            };


            const payment_data = {
                
                supplier_id: supplierId,
                invoice_number: purchaseId,
                payment_date: req.body.payment_date || new Date(),
                payment_method: req.body.payment_method || 'cash',
                payment_amount: Number(req.body?.paid_amount || 0).toFixed(2),
                created_at: new Date(),
                updated_at: new Date(),
            };
            console.log("payment_data", payment_data);
            const updateSupplier = {
                $set: {
                    total_amount: Number((supplier?.total_amount ?? 0) + netTotal).toFixed(2),
                    total_paid: Number((supplier?.total_paid ?? 0) + (req.body?.paid_amount || 0)).toFixed(2),
                    total_due: Number((supplier?.total_due ?? 0) + (netTotal - (req.body?.paid_amount || 0))).toFixed(2),
                    updated_at: new Date()
                }
            }

            const purchase = await Purchase.create(purchaseData);
            if (!purchase) {
                ResponseService.jsonResponse(400, null, res, req, "Failed to record purchase");
                return;
            }
            const purchaseItemRecord = await PurchaseItems.insertMany(purchaseItems);
            if (!purchaseItemRecord || purchaseItemRecord.length !== purchaseItems.length) {
                const purchaseDeleteResult = await Purchase.deleteOne({ invoice_number: purchaseId });
                const itemsDeleteResult = await PurchaseItems.deleteMany({ invoice_number: purchaseId });
                if (purchaseDeleteResult.deletedCount === 0 || itemsDeleteResult.deletedCount === 0) {
                    ResponseService.jsonResponse(500, null, res, req, "Failed to delete purchase or purchase items during rollback", false);
                    return;
                }
                ResponseService.jsonResponse(400, null, res, req, "Failed to record purchase items" + JSON.stringify({ purchaseItemRecordLength: purchaseItemRecord.length, purchaseItemsLength: purchaseItems.length }), false);
                return;
            }

            for (const product of fetchProducts) {
                const saleItem = purchaseItemRecord.find(item => item.product_id === product.product_id);
                if (saleItem) {
                    const newQty = Number(((product.opening_stock_qty || 0) + Number(saleItem.quantity || 0)).toFixed(2));
                    await ProductModel.updateOne(
                        { product_id: product.product_id },
                        { $set: { opening_stock_qty: newQty } }
                    );
                }
            }


            if (req.body?.paid_amount && req.body?.paid_amount > 0) {
                const payment = await PurchasePayments.insertOne(payment_data);
                if (!payment) {
                    const purchaseDeleteResult = await Purchase.deleteOne({ invoice_number: purchaseId });
                    const itemsDeleteResult = await PurchaseItems.deleteMany({ invoice_number: purchaseId });
                    await PurchasePayments.deleteMany({ invoice_number: purchaseId });
                    if (purchaseDeleteResult.deletedCount === 0 || itemsDeleteResult.deletedCount === 0) {
                        ResponseService.jsonResponse(500, null, res, req, "Failed to delete purchase or purchase items during rollback", false);
                        return;
                    }
                    ResponseService.jsonResponse(400, null, res, req, "Failed to record payment" + JSON.stringify(payment), false);
                    return;
                }
            }

            const supplierUpdate = await SupplierModel.updateOne({ supplier_id: supplierId }, updateSupplier);
            if (!supplierUpdate || supplierUpdate.modifiedCount === 0) {
                const purchaseDeleteResult = await Purchase.deleteOne({ invoice_number: purchaseId });
                const itemsDeleteResult = await PurchaseItems.deleteMany({ invoice_number: purchaseId });
                const paymentsDeleteResult = await PurchasePayments.deleteOne({ invoice_number: purchaseId });
                if (purchaseDeleteResult.deletedCount === 0 || itemsDeleteResult.deletedCount === 0 || (req.body.paid && paymentsDeleteResult.deletedCount === 0)) {
                    ResponseService.jsonResponse(500, null, res, req, "Failed to delete purchase or purchase items during rollback", false);
                    return;
                }
                ResponseService.jsonResponse(400, null, res, req, "Failed to update supplier" + JSON.stringify(supplierUpdate), false);
                return;
            }
            ResponseService.jsonResponse(201, purchase, res, null, "Purchase recorded successfully");
        } catch (error: any) {
            ErrorService.handleError(error, res, req);
        }
    }


    /**
     * Get detailed information about a specific purchase including all purchased items
     * 
     * @param req - Request object with invoice_number as parameter
     * @param res - Response object
     * 
     * @route GET /api/purchase/:invoice_number
     */
    public static async view(req: any, res: any) {
        try {
            const billNo = req.params.id;
           

            const purchase = await Purchase.findOne({
                invoice_number: billNo,
                
                status: { $ne: 0 }  // Not deleted
            });

            if (!purchase) {
                return ResponseService.jsonResponse(404, null, res, req, "Purchase not found", false);
            }

            // Get supplier details
            const supplier = await SupplierModel.findOne({
                
                supplier_id: purchase.supplier_id
            });

            const purchaseItems = await PurchaseItems.aggregate([
                {
                    $match: {
                        invoice_number: billNo,
                        
                        status: { $ne: 0 } // Not deleted
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
                        product_code: '$product.product_code',
                        product_price: '$product.purchasesale_price',
                    }
                },
                {
                    $project: {
                        _id: 0,
                        invoice_number: 1,
                        product_id: 1,
                        product_name: 1,
                        product_price: 1,
                        quantity: 1,
                        total_amount: 1,
                    }
                },
                {
                    $sort: { product_name: 1 }
                }
            ]);

            ResponseService.jsonResponse(200, {
                purchase,
                purchaseItems,
                supplier: supplier ? {
                    supplier_id: supplier.supplier_id,
                    business_name: supplier.business_name,
                    mobile_number: supplier.mobile_number,
                    address: supplier.address
                } : {
                    supplier_id: purchase.supplier_id,
                    business_name: 'Unknown Supplier'
                }
            }, res, null, "Purchase fetched successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }
}

export { Purchase };
