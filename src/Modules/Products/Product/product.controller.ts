/**
 * Product Controller
 * 
 * This module provides controller methods for CRUD operations on products.
 * It handles creating, retrieving, updating and deleting products, including image handling.
 */

import ProductModel from './product.model';
import { PurchaseItems } from '../../Purchases/Purchases/purchase.items.model';
import { SalesModel } from '../../Sales/Sales/sale.model';
import { UploadService } from '../../../Services/UploadService';
import path from 'path';
import { ResponseService } from '../../../Services/ResponseService';
import { ErrorService } from '../../../Services/ErrorService';
import fs from 'fs';
import { ValidationService } from '../../../Services/valdiationService';

export class Products {

    /**
    * Lists all products filtered by  and status
    * 
    * @param req - Request object containing 
    * @param res - Response object
    * 
    * @description
    * Retrieves products for a specific  with status 1 and 2 (excluding status 0/inactive)
    * Adds absolute URLs to product images for client-side rendering
    */
    public static async list(req: any, res: any) {
        try {
            
           
            const searchTerm = req.body.search || '';
            const limit = parseInt(req.body.limit, 10) || 100;
            const page = parseInt(req.body.page, 10) || 1;
            const category = req.body.category || '';
            const availability = req.body?.availability || '';

            /* Create filter object combining  and status filters */
            const filter: any = {
                
                status: 1,
                $or: [
                    { product_name: { $regex: searchTerm, $options: 'i' } },
                    { product_code: { $regex: searchTerm, $options: 'i' } }
                ],
            };
            if (category) filter.category = category;
            if (availability) filter.availability;


            let sortBy: any;
            switch (req.body.sort_by) {
                case 1:
                    sortBy = { product_id: -1 };
                    break;
                case 2:
                    sortBy = { product_id: 1 };
                    break;
                case 3:
                    sortBy = { product_name: 1 };
                    break;
                case 4:
                    sortBy = { product_name: -1 };
                    break;
                case 5:
                    sortBy = { retailsales_price: -1 };
                    break;
                case 6:
                    sortBy = { retailsales_price: -1 };
                    break;
                default:
                    sortBy = { product_id: -1 };
                    break;
            }

            const baseUrl = req.protocol + '://' + req.get('host');
            /* Use aggregation pipeline for more flexible querying and future extensibility */
            const products = await ProductModel.aggregate([
                {
                    $match: filter
                },
                {
                    $lookup: {
                        from: 'product_categories',
                        localField: 'category',
                        foreignField: 'category_id',
                        as: 'category_info'
                    }
                },
                {
                    $lookup: {
                        from: 'product_units',
                        localField: 'unit',
                        foreignField: 'unit_id',
                        as: 'unit_info'
                    }
                },
                {
                    $lookup: {
                        from: 'product_brands',
                        localField: 'brand',
                        foreignField: 'brand_id',
                        as: 'brand_info'
                    }
                },
                {
                    $lookup: {
                        from: 'tax_settings',
                        localField: 'tax',
                        foreignField: 'tax_id',
                        as: 'tax_info'
                    }
                },
                {
                    $lookup: {
                        from: 'suppliers',
                        localField: 'supplier',
                        foreignField: 'supplier_id',
                        as: 'supplier_info'
                    }
                },
                {
                    $unwind: {
                        path: '$tax_info',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: '$brand_info',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: '$category_info',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: '$unit_info',
                        preserveNullAndEmptyArrays: true
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
                        brand_name: { $ifNull: ['$brand_info.brand_name', ''] },
                        supplier_name: { $ifNull: ['$supplier_info.contact_person', ''] },
                        supplier_business_name: { $ifNull: ['$supplier_info.business_name', ''] },
                        tax_value: { $ifNull: ['$tax_info.tax.gst', ''] },
                        category_name: { $ifNull: ['$category_info.category_name', ''] },
                        unit_name: { $ifNull: ['$unit_info.unit_name', ''] },
                        available_stock_qty: {
                            $subtract: [
                                { $ifNull: ['$opening_stock_qty', 0] },
                                { $ifNull: ['$sold_qty', 0] }
                            ]
                        }
                    }
                },
                {
                    $project: {
                        category_info: 0,
                        unit_info: 0,
                        brand_info: 0,
                        tax_info: 0,
                        supplier_info: 0,
                        updated_at: 0,
                        created_at: 0,
                        __v: 0
                    }
                },
                { $sort: sortBy },
                { $skip: (page - 1) * limit },
                { $limit: limit }
            ]);

            const processedProducts = products.map(product => {
                let imageUrl: string;
                if (product.product_image) {
                    const imagePath = path.join(__dirname, '../../../../public/assets/images/products', product.product_image);
                    if (fs.existsSync(imagePath)) {
                        imageUrl = `${baseUrl}/public/assets/images/products/${product.product_image}`;
                    } else {
                        imageUrl = `${baseUrl}/public/assets/images/products/default.png`;
                    }
                } else {
                    imageUrl = `${baseUrl}/public/assets/images/products/default.png`;
                }
                return {
                    ...product,
                    product_image: imageUrl
                };

            });

            const message = "All active products retrieved successfully";

            const totalCount = await ProductModel.countDocuments({ });
            const in_stock = await ProductModel.countDocuments({
                
                availability: 1
            });
            const out_stock = await ProductModel.countDocuments({
                
                availability: 0
            });

            ResponseService.jsonResponse(200, { processedProducts, totalCount, in_stock, out_stock }, res, req, message);
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * Creates a new product
     * 
     * @param req - Request object containing product data
     * @param res - Response object
     * 
     * @description
     * 1. Validates category existence
     * 2. Validates the incoming product data
     * 3. Generates a new unique product ID
     * 4. Handles product image upload
     * 5. Saves the new product to the database
     * 6. Returns the created product
     */
    public static async create(req: any, res: any) {
        try {
            let file: any;
            if (Array.isArray(req.files)) {
                file = req.files.find((f: any) => f.fieldname === 'product_image');
            }  else if (req.files)  {
                /*  If req.files is an object, access by fieldName */
                file = (req.files as { [fieldname: string]: any })['product_image'];
            }

            let filename: any;
            if (file?.originalname) {
                const ext = path.extname(file.originalname);
                filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            }

            const rawdatadata = {
                product_id: '',
                product_image: filename || '',
                product_name: req.body.product_name,
                product_code: req.body.product_code,
                unit: req.body.unit,
                category: req.body?.category,
                brand: req.body?.brand,
                tax: req.body.tax,
                tax_type: req.body?.tax_type || 1,
                hsn_sac_code: req.body.hsn_sac_code,
                supplier: req.body.supplier,
                mrp: Number(req.body.mrp).toFixed(2),
                retailsales_price: Number(req.body.retailsales_price).toFixed(2),
                purchasesale_price: Number(req.body.purchasesale_price).toFixed(2),
                wholesale_price: Number(req.body.wholesale_price).toFixed(2),
                opening_stock_qty: Number(req.body.opening_stock_qty).toFixed(2),
                min_stock_qty: Number(req.body.min_stock_qty).toFixed(2),
                store_location: req.body.store_location,
                handled_by: req.headers['user_id'],
                created_at: new Date(),
                updated_at: new Date()
            }

            const data = ValidationService.cleanData(rawdatadata);
            /* Validate the data before generating an ID */
            await new ProductModel(data).validate();

            /* Generate a new sequential product ID (format: PRO####) */
           
            const lastProduct = await ProductModel.findOne(
                { }
            ).sort({ product_id: -1 });

            let lastProductId;
            if (!lastProduct) {
                lastProductId = 'PRO0000';
            } else {
                lastProductId = lastProduct.product_id;
            }

            /* Generate next available product ID */
            let newId: string;
            let existingProduct: any;
            let numericSuffix = parseInt(lastProductId.substring(3), 10) || 0;
            const prefix = lastProductId.substring(0, 3);

            do {
                numericSuffix += 1;
                const paddingLength = Math.max(4 - String(numericSuffix).length, 0);
                const paddedSuffix = numericSuffix.toString().padStart(paddingLength + String(numericSuffix).length, '0');
                newId = prefix + paddedSuffix;
                existingProduct = await ProductModel.findOne({ product_id: newId });
            } while (existingProduct);

            data.product_id = newId;

            const product = new ProductModel(data);
            await product.save();

            /* Handle image upload if present */
            if (data.product_image) {
                const upload = await UploadService.FileUploader(
                    req,
                    'product_image',
                    path.join(__dirname, '../../../../public/assets/images/products'),
                    ['image/jpg', 'image/png', 'image/jpeg'],
                    filename
                );
            }


            /* Return success response */
            ResponseService.jsonResponse(201, product, res, req, "Product created successfully");
            return;

        } catch (error: any) {
            // Handle duplicate key errors
            if (error && error.name === 'MongoServerError' && error.code === 11000) {
                const duplicateKey = Object.keys(error.keyPattern || {})[0];
                error.keyPattern.brand_name = error.keyPattern[duplicateKey];
                delete error.keyPattern[duplicateKey];
                error.keyValue.brand_name = error.keyValue[duplicateKey];
                delete error.keyValue[duplicateKey];                
            }


            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
      * Retrieves a specific product by ID for the current 
      * 
      * @param req - Request object containing product ID in params and  in headers
      * @param res - Response object
      * 
      * @description
      * 1. Extracts the product ID from request params
      * 2. Extracts  ID from request headers
      * 3. Validates that required IDs are provided
      * 4. Finds the product by ID and 
      * 5. Returns the product or a not found response
      */
    public static async edit(req: any, res: any) {
        try {
            const productId = req.params.id;
           

            const product = await ProductModel.aggregate([
                {
                    $match: {
                        product_id: productId,
                       
                    }
                },
                {
                    $lookup: {
                        from: 'product_categories',
                        localField: 'category',
                        foreignField: 'category_id',
                        as: 'category_info'
                    }
                },
                {
                    $lookup: {
                        from: 'product_units',
                        localField: 'unit',
                        foreignField: 'unit_id',
                        as: 'unit_info'
                    }
                },
                {
                    $lookup: {
                        from: 'product_brands',
                        localField: 'brand',
                        foreignField: 'brand_id',
                        as: 'brand_info'
                    }
                },
                {
                    $lookup: {
                        from: 'tax_settings',
                        localField: 'tax',
                        foreignField: 'tax_id',
                        as: 'tax_info'
                    }
                },
                {
                    $unwind: {
                        path: '$category_info',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: '$unit_info',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        category_name: '$category_info.category_name',
                        unit_name: '$unit_info.unit_name',
                        brand_name: { $ifNull: [{ $arrayElemAt: ['$brand_info.brand_name', 0] }, ''] },
                        tax_value: { $ifNull: [{ $arrayElemAt: ['$tax_info.tax.gst', 0] }, ''] },
                        available_stock_qty: {
                            $subtract: [
                                { $ifNull: ['$opening_stock_qty', 0] },
                                { $ifNull: ['$sold_qty', 0] }
                            ]
                        }
                    }
                },
                {
                    $project: {
                        category_info: 0,
                        unit_info: 0,
                        tax_info: 0,
                        brand_info: 0
                    }
                },
                { $limit: 1 }
            ]);

            /* Return 404 if product not found */
            if (!product || product.length === 0) {
                return ResponseService.jsonResponse(404, null, res, req, "Product not found");
            }

            /* Add full image URL if product has an image */
            if (product[0]?.product_image) {
                const baseUrl = req.protocol + '://' + req.get('host');
                if (!fs.existsSync(path.join(__dirname, '../../../../public/assets/images/products', product[0].product_image))) {
                    product[0].product_image = baseUrl + '/public/assets/images/products/default.png';
                } else {
                    product[0].product_image = baseUrl + '/public/assets/images/products/' + (product[0].product_image || 'default.png');
                }
            }
            const singleProduct = product[0];

            /* Return success response with product */
            ResponseService.jsonResponse(200, singleProduct, res, req, "Product retrieved successfully");
            return;

        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
      * Updates a specific product for the current 
      * 
      * @param req - Request object containing product ID in params,  in headers, and update data in body
      * @param res - Response object
      * 
      * @description
      * 1. Extracts the product ID and  ID
      * 2. Validates that both IDs are provided
      * 3. Finds the product to update by ID and 
      * 4. Updates the product with new data while preserving existing values for unspecified fields
      * 5. Handles product image upload if a new image is provided
      * 6. Returns the updated product
      */
    public static async update(req: any, res: any) {
        try {

            const productId = req.params.id;
           
            const userId = req.headers['user_id'];

            /* Step 1: Find existing product (needed for fallback values & image cleanup) */
            const existingProduct = await ProductModel.findOne({
                product_id: productId,
               
            });

            if (!existingProduct) {
                return ResponseService.jsonResponse(404, null, res, req, "Product not found");
            }

            let file: any;
            if (Array.isArray(req.files)) {
                file = req.files.find((f: any) => f.fieldname === 'product_image');
            }  else if (req.files ) {
                /*  If req.files is an object, access by fieldName */
                file = (req.files as { [fieldname: string]: any })['product_image'];
            }


            let filename: any;
            if (file?.originalname) {
                const ext = path.extname(file.originalname);
                filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            }


            /* Step 3: Build update data using fallback values from existing product */
            const rawUpdateData = {
                product_image: filename,
                product_name: req.body.product_name,
                product_code: req.body.product_code,
                unit: req.body.unit,
                category: req.body.category,
                brand: req.body?.brand,
                tax: req.body.tax,
                hsn_sac_code: req.body.hsn_sac_code,
                supplier: req.body.supplier,
                mrp: Number(req.body.mrp).toFixed(2),
                retailsales_price: Number(req.body.retailsales_price).toFixed(2),
                purchasesale_price: Number(req.body.purchasesale_price).toFixed(2),
                wholesale_price: Number(req.body.wholesale_price).toFixed(2),
                min_stock_qty: Number(req.body.min_stock_qty).toFixed(2),
                store_location: req.body.store_location,
                handled_by: userId,
                updated_at: new Date()
            };

            const updateData = ValidationService.cleanData(rawUpdateData);
            await new ProductModel(updateData).validate();
            const updatedProduct = await ProductModel.findOneAndUpdate(
                {
                    product_id: productId,
                   
                },
                updateData,
                { new: true, runValidators: true }
            );

            if (req.files?.product_image) {
                const upload = await UploadService.FileUploader(
                    req,
                    'product_image',
                    path.join(__dirname, '../../../../public/assets/images/products'),
                    ['image/jpg', 'image/png', 'image/jpeg'],
                    filename
                );
            }

            /* Step 5: Delete old image if replaced */
            if (
                updatedProduct &&
                existingProduct.product_image &&
                existingProduct.product_image !== updateData.product_image &&
                existingProduct.product_image !== 'default.png'
            ) {
                const oldImagePath = path.join(__dirname, '../../../../public/assets/images/products', existingProduct.product_image);
                if (fs.existsSync(oldImagePath)) {
                    try {
                        fs.unlinkSync(oldImagePath);
                    } catch (err) {
                        console.error('Failed to delete old product image:', err);
                    }
                }
            }

            /* Step 6: Add full image URL to the response */
            if (updatedProduct?.product_image) {
                const baseUrl = req.protocol + '://' + req.get('host');
                updatedProduct.product_image = `${baseUrl}/public/assets/images/products/${updatedProduct.product_image}`;
            }

            /* Final Response */
            return ResponseService.jsonResponse(200, updatedProduct, res, req, "Product updated successfully");

        } catch (error: any) {
            /* Unique constraint error handling */
            if (error?.name === 'MongoServerError' && error.code === 11000) {
                const duplicateKey = Object.keys(error.keyPattern || {})[0];
                // Rename key in keyPattern
                error.keyPattern.product_name = error.keyPattern[duplicateKey];
                delete error.keyPattern[duplicateKey];

                // Rename key in keyValue
                error.keyValue.product_name = error.keyValue[duplicateKey];
                delete error.keyValue[duplicateKey];
            }

            return ErrorService.handleError(error, res, req);
        }
    }

    /**
     * Deletes a specific product for the current  if it's not in use
     * 
     * @param req - Request object containing product ID in params and  in headers
     * @param res - Response object
     */
    public static async delete(req: any, res: any) {
        try {
            const productId = req.params.id;
           

            /* Find the product by ID and  */
            const product = await ProductModel.findOne({
                _id: productId,
               
            });

            /* Return 404 if product not found */
            if (!product) {
                return ResponseService.jsonResponse(404, null, res, req, "Product not found");
            }

            /* Try to check if product is used in purchase history */
            try {
                const purchaseHistoryCount = await PurchaseItems.exists({
                    
                    product_id: product.product_id,
                    status: 1
                });

                if (purchaseHistoryCount) {
                    return ResponseService.jsonResponse(
                        400,
                        { count: 1 },
                        res,
                        req,
                        "Cannot delete product because it is used in purchase records"
                    );
                }

                /* Check if the Sales collection exists and has documents with this product */
                const salesCount = await SalesModel.exists({
                    
                    'products.product_id': product.product_id,/* Assuming products are stored in an array */
                    status: 1
                });

                if (salesCount) {
                    return ResponseService.jsonResponse(
                        400,
                        { count: 1 },
                        res,
                        req,
                        "Cannot delete product because it is used in sales records"
                    );
                }
            } catch (checkError) {
                console.log("Error checking related collections:", checkError);
                /* Continue with deletion even if checks fail */
            }

            /* Delete the product if it's not in use or if checks couldn't be performed */
            const deleteResult = await ProductModel.deleteOne({
                _id: productId
            });

            /* Check if product was actually deleted */
            if (deleteResult.deletedCount === 0) {
                return ResponseService.jsonResponse(500, null, res, req, "Product could not be deleted");
            }

            /* Return success response */
            ResponseService.jsonResponse(200, {
                _id: productId,
                deleted: true
            }, res, req, "Product deleted successfully");
            return;

        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }
    /**
     * Updates the availability status of a product
     * 
     * @param req - Request object containing product ID in params,  in headers, and availability in body
     * @param res - Response object
     * 
     * @description
     * 1. Extracts the product ID and  ID
     * 2. Validates that both IDs are provided
     * 3. Validates that availability value is valid (0 or 1)
     * 4. Finds the product by ID and 
     * 5. Updates the product's availability status
     * 6. Returns the updated product
     */
    public static async updateAvailability(req: any, res: any) {
        try {
            const productId = req.params.id;
           
            const availability = req.body.availability;

            /* Validate availability value */
            if (availability !== 0 && availability !== 1) {
                return ResponseService.jsonResponse(400, null, res, req, "Availability must be either 0 (Out of Stock) or 1 (In Stock)");
            }

            /* Find the product by ID and  */
            const product = await ProductModel.findOne({
                product_id: productId,
               
            });

            /* Return 404 if product not found */
            if (!product) {
                return ResponseService.jsonResponse(404, null, res, req, "Product not found ");
            }

            /* Update the product's availability */
            const updatedProduct = await ProductModel.findOneAndUpdate(
                {
                    product_id: productId,
                   
                },
                {
                    availability: availability,
                    updated_at: new Date()
                },
                { new: true } /* Return updated document */
            );

            /* Add full image URL to the response */
            if (updatedProduct?.product_image) {
                const baseUrl = req.protocol + '://' + req.get('host');
                updatedProduct.product_image = baseUrl + '/public/assets/images/products/' + updatedProduct.product_image;
            }

            ResponseService.jsonResponse(200, updatedProduct, res, req, "Product availability updated successfully");
            return;

        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

}