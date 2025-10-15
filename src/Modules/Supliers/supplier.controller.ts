/**
 * Supplier Controller
 * 
 * This module provides controller methods for CRUD operations on suppliers.
 * It handles creating, retrieving, updating and deleting suppliers.
 */

import { ErrorService } from '../../Services/ErrorService';
import { ResponseService } from '../../Services/ResponseService';
import { UploadService } from '../../Services/UploadService';
import { ValidationService } from '../../Services/valdiationService';
import Supplier from '../Supliers/supplier.model';
import path from "path";
import fs from 'fs';


export class Suppliers {

    /**
    * Creates a new supplier
    * 
    * @param req - Request object containing supplier data
    * @param res - Response object
    * 
    * @description
    * 1. Validates the incoming supplier data
    * 2. Finds the last supplier ID for the  to generate a new sequential ID
    * 3. Saves the new supplier to the database
    * 4. Returns the created supplier
    */

    public static async create(req: any, res: any) {
        try {
            let file: any;
            if (Array.isArray(req.files)) {
                file = req.files.find((f: any) => f.fieldname === 'supplier_logo');
            } else if(req.files) {
                file = (req.files as { [fieldname: string]: any })['supplier_logo'];
            }

            let filename: any;
            if (file?.originalname) {
                const ext = path.extname(file.originalname);
                filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            }

            let rawdata = {
                
                supplier_id: '',
                supplier_logo: filename || '',
                supplier_type: req.body?.supplier_type || 1,
                business_name: req.body?.business_name || '',
                contact_person: req.body?.contact_person || '',
                mobile_number: req.body?.mobile_number || '',
                country: req.body?.country || '',
                state: req.body?.state || '',
                city: req.body?.city || '',
                address: req.body?.address || '',
                gst_number: req.body?.gst_number || '',
                gst_state_code: req.body?.gst_state_code || '',
                notes: req.body?.notes || '',
                pincode: req.body?.pincode || ''
            };

            const data = ValidationService.cleanData(rawdata);
            await new Supplier(data).validate();

            const lastSupplier = await Supplier.findOne().sort({ supplier_id: -1 });
            let lastSupplierId = lastSupplier?.supplier_id || 'SUP0000';
            let numericSuffix = parseInt(lastSupplierId.substring(3), 10) || 0;
            let newId: string;
            let existingSupplier: any;
            const prefix = lastSupplierId.substring(0, 3);
            do {
                numericSuffix += 1;
                const paddedSuffix = numericSuffix.toString().padStart(4, '0');
                newId = prefix + paddedSuffix;
                existingSupplier = await Supplier.findOne({  supplier_id: newId });
            } while (existingSupplier);

            data.supplier_id = newId;

            let supplier = new Supplier(data);
            supplier = await supplier.save();

            if (req.files && req.files.length > 0) {
                await UploadService.FileUploader(
                    req,
                    'supplier_logo',
                    path.join(__dirname, '../../../../src/public/assets/images/suppliers'),
                    ['image/jpg', 'image/png', 'image/jpeg'],
                    filename
                );
            }

            let responseObj = supplier.toObject();
            if (responseObj.supplier_type === 4) {
                responseObj.gst_number = null;
                responseObj.gst_state_code = null;
            }

            ResponseService.jsonResponse(201, responseObj, res, null, "Supplier created successfully");
        } catch (error: any) {
            console.error("Error creating supplier:", error);
            ErrorService.handleError(error, res, req);
        }
    }


    public static async suppliertype(req: any, res: any) {
        const types = [
            { value: 1, name: "Manufacturer" },
            { value: 2, name: "Dealer" },
            { value: 3, name: "Distributor" },
            { value: 4, name: "Unregistered Supplier" }
        ];
        ResponseService.jsonResponse(200, types, res, req, "Supplier types fetched successfully");
    }

    /**
         * Lists all Suppliers
         * 
         * @param req - Request object
         * @param res - Response object
         * 
         * @description
         * Retrieves all suppliers sorted by supplier_id and returns them in the response
         */

    public static async list(req: any, res: any) {
        try {
           

            // By default, show only status 1 and 2 suppliers (not status 0)
            let statusFilter: any = {};

            if (req.body?.status === 0) {
                statusFilter = 0;
            } else if (req.body?.status === 1) {
                statusFilter = 1;
            } else {
                statusFilter = { $in: [1, 2] };
            }

            const searchTerm = req.body?.searchTerm;
            const page = req.body?.page || 1;
            const limit = req.body?.limit || 50;

            const filter: any = {
               
            };

            if (statusFilter) filter.status = statusFilter;

            if (searchTerm) filter.$or = [
                { business_name: { $regex: searchTerm, $options: 'i' } },
                { contact_person: { $regex: searchTerm, $options: 'i' } },
                { mobile_number: { $regex: searchTerm, $options: 'i' } },
                { supplier_id: { $regex: searchTerm, $options: 'i' } },
                { gst_number: { $regex: searchTerm, $options: 'i' } },
            ];

            let sortBy: any;
            switch (req.body?.sort_by) {
                case 1:
                    sortBy = { created_at: -1 };
                    break;
                case 2:
                    sortBy = { created_at: 1 };
                    break;
                case 3:
                    sortBy = { business_name: 1 };
                    break;
                case 4:
                    sortBy = { business_name: -1 };
                    break;
                case 5:
                    sortBy = { mobile_number: -1 };
                    break;
                case 6:
                    sortBy = { mobile_number: -1 };
                    break;
                default:
                    sortBy = { supplier_id: -1 };
                    break;
            }

            // Aggregate suppliers with purchase totals
            const suppliers = await Supplier.aggregate([
                { $match: filter },
                {
                    $lookup: {
                        from: 'purchases',
                        localField: 'supplier_id',
                        foreignField: 'supplier_id',
                        as: 'purchases'
                    }
                },
                {
                    $addFields: {
                        total: { $sum: '$purchases.total' },
                        paid: { $sum: '$purchases.paid' },
                        outstanding: { $sum: '$purchase.outstanding' }
                    }
                },
                {
                    $project: {
                        // _id: 0,
                        // supplier_id: 1,
                        // business_name: 1,
                        // contact_person: 1,
                        // mobile_number: 1,
                        // country: 1,
                        // state: 1,
                        // city: 1,
                        // address: 1,
                        // gst_number: 1,
                        // gst_state_code: 1,
                        // notes: 1,
                        // supplier_logo: 1,
                        // total_amount: 1,
                        // paid_amount: 1,
                        // balance_amount: 1,
                        // status: 1
                        purchases: 0
                    }
                },
                { $sort: sortBy },
                { $skip: (page - 1) * limit },
                { $limit: limit }
            ]);

            // Add base URL to supplier logos
            const baseUrl = req.protocol + '://' + req.get('host');

            // Transform suppliers to include full logo URLs
            const suppliersWithFullLogoUrls = suppliers.map(supplier => {
                supplier.supplier_logo = baseUrl + '/public/assets/images/suppliers/' + (supplier.supplier_logo || 'default.png');
                return supplier;
            });

            const message =  "All active suppliers retrieved successfully";

            ResponseService.jsonResponse(200, suppliersWithFullLogoUrls, res, req, message);
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }


    /**
    * Retrieves a specific Supplier by ID
    * 
    * @param req - Request object containing Supplier ID in params
    * @param res - Response object
    * 
    * @description
    * 1. Extracts the Supplier ID from request params
    * 2. Validates that an ID was provided
    * 3. Finds the Supplier by ID
    * 4. Returns the Supplier or a not found response
    */
    public static async edit(req: any, res: any) {
        try {
            const supplierId = req.params.id;
           
            const baseUrl = req.protocol + '://' + req.get('host');

            // Only fetch suppliers with status 1 or 2 (not 0)
            const supplier = await Supplier.findOne({
                supplier_id: supplierId,
                
                status: { $in: [1, 2] }
            }, { __v: 0, created_at: 0, updated_at: 0 });

            if (!supplier) {
                ResponseService.jsonResponse(404, null, res, req, "supplier not found");
                return;
            }

            // For supplier_type 4, always show gst_number and gst_state_code as null
            if (supplier.supplier_type === 4) {
                delete supplier?.gst_number;
                delete supplier?.gst_state_code;
            }

            // Add full logo URL

            if (supplier.supplier_logo && !fs.existsSync(path.join(__dirname, '../../../public/assets/images/suppliers', supplier.supplier_logo))) {
                supplier.supplier_logo = baseUrl + '/public/assets/images/suppliers/' + 'default.png';
            } else {
                supplier.supplier_logo = baseUrl + '/public/assets/images/suppliers/' + (supplier.supplier_logo || 'default.png');
            }

            ResponseService.jsonResponse(200, supplier, res, null, "supplier fetched successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
    * Updates a specific supplier
    * 
    * @param req - Request object containing supplier ID in params and update data in body
    * @param res - Response object
    * 
    * @description
    * 1. Extracts the supplier ID and validates it
    * 2. Finds the supplier to update
    * 3. Updates the supplier with new data while preserving existing values for unspecified fields
    * 4. Returns the updated supplier
    */

    public static async update(req: any, res: any) {
        try {
            const supplierId = req.params.id;
           

            // Find the existing supplier
            const existingSupplier = await Supplier.findOne({ supplier_id: supplierId });
            if (!existingSupplier) {
                return ResponseService.jsonResponse(404, null, res, req, "supplier not found");
            }

            // Handle file upload (supplier_logo)
            let file: any;
            if (Array.isArray(req.files)) {
                file = req.files.find((f: any) => f.fieldname === 'supplier_logo');
            } else if (req.files && req.files['supplier_logo']) {
                file = req.files['supplier_logo'];
            }

            let filename: any;
            if (file?.originalname) {
                const ext = path.extname(file.originalname);
                filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            }

            const rawdataUpdateData = {
                supplier_logo: filename,
                supplier_type: req.body?.supplier_type,
                business_name: req.body?.business_name,
                contact_person: req.body?.contact_person,
                mobile_number: req.body?.mobile_number,
                country: req.body?.country,
                state: req.body?.state,
                city: req.body?.city,
                pincode: req.body?.pincode,
                address: req.body?.address,
                gst_number: req.body?.gst_number,
                gst_state_code: req.body?.gst_state_code,
                notes: req.body?.notes,
                updated_at: new Date()
            };

            let updateData = ValidationService.cleanData(rawdataUpdateData);
            await new Supplier(updateData).validate();
            console.log("Update data validated:", updateData);
            const supplier = await Supplier.findOneAndUpdate(
                { supplier_id: supplierId },
                updateData,
            );

            if (file) {
                const upload = await UploadService.FileUploader(
                    req,
                    'supplier_logo',
                    path.join(__dirname, '../../../../src/public/assets/images/suppliers'),
                    ['image/jpg', 'image/png', 'image/jpeg'],
                    filename
                );

                if (upload && upload.filename) {
                    if (existingSupplier?.supplier_logo) {
                        const oldLogoPath = path.join(__dirname, '../../../../src/public/assets/images/suppliers', existingSupplier.supplier_logo);
                        if (fs.existsSync(oldLogoPath)) {
                            fs.unlinkSync(oldLogoPath);
                        }
                    }
                }
            }

            if (supplier?.supplier_logo) {
                const baseUrl = req.protocol + '://' + req.get('host');
                supplier.supplier_logo = baseUrl + '/public/assets/images/suppliers/' + (supplier.supplier_logo || 'default.png');
            }

            // For supplier_type 4, always show GST fields as null in response
            if (supplier?.supplier_type === 4) {
                supplier.gst_number = null;
                supplier.gst_state_code = null;
            }

            ResponseService.jsonResponse(200, supplier, res, req, "supplier updated successfully");
        } catch (error: any) {
            ErrorService.handleError(error, res, req);
        }
    }


    /**
    * Deletes a specific supplier
    * 
    * @param req - Request object containing supplier ID in params
    * @param res - Response object
    * 
    * @description
    * 1. Extracts the supplier ID and validates it
    * 2. Finds the supplier to delete
    * 3. Checks if any products are using this supplier
    * 4. Deletes the supplier if not in use
    */

    public static async delete(req: any, res: any) {
        try {
            const supplierId = req.params.id;
           

            // Validate that supplier ID was provided
            if (!supplierId) {
                return res.status(400).json({
                    success: false,
                    message: "Supplier ID is required"
                });
            }

            // Validate that  ID is provided
          

            // Find the supplier to soft delete by ID and 
            const supplier = await Supplier.findOne({
                supplier_id: supplierId,
               
            });

            // Return 404 if supplier not found
            if (!supplier) {
                return res.status(404).json({
                    success: false,
                    message: "Supplier not found for this "
                });
            }

            // Soft delete the supplier by updating status to 0 (inactive)
            const updatedSupplier = await Supplier.findOneAndUpdate(
                {
                    supplier_id: supplierId,
                   
                },
                {
                    status: 0, // Set to inactive
                    updated_at: new Date()
                },
                { new: true } // Return the updated document
            );

            // Return success response
            ResponseService.jsonResponse(200, updatedSupplier, res, req, "Supplier deactivated successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

}
