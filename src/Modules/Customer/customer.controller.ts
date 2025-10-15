import CustomerModel from './customer.model';
import { ResponseService } from '../../Services/ResponseService';
import { ErrorService } from '../../Services/ErrorService';
import { UploadService } from '../../Services/UploadService';
import path from 'path';
import fs from 'fs';
import { ValidationService } from '../../Services/valdiationService';

export class CustomerController {

    /**
    * Creates a new customerCustomerModel
    * 
    * @param req - Request object containing customer data
    * @param res - Response object
    * 
    * @description
    * 1. Validates the incoming customer data
    * 2. Finds the last customer ID for the  to generate a new sequential ID
    * 3. Saves the new customerCustomerModel to the database
    * 4. Returns the created customer
    */

    /**
     * Lists all customer
     * 
     * @param req - Request object
     * @param res - Response object
     * 
     * @description
     * Retrieves all customer sorted by supplier_id and returns them in the response
     */
    public static async list(req: any, res: any) {
        try {
        
            /* By default, show only status 1 and 2 customers (not status 0) */
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
            const filter: any = {};
            if (statusFilter) filter.status = statusFilter;

            if (searchTerm) filter.$or = [
                { customer_name: { $regex: searchTerm, $options: 'i' } },
                { mobile_number: { $regex: searchTerm, $options: 'i' } },
                { customer_id: { $regex: searchTerm, $options: 'i' } },
                { point_card: { $regex: searchTerm, $options: 'i' } },
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
                    sortBy = { customer_name: 1 };
                    break;
                case 4:
                    sortBy = { customer_name: -1 };
                    break;
                case 5:
                    sortBy = { mobile_number: -1 };
                    break;
                case 6:
                    sortBy = { mobile_number: -1 };
                    break;
                default:
                    sortBy = { customer_id: 1 };
                    break;
            }

            /* Retrieve filtered customers sorted by customer_id in ascending order */
            const customers = await CustomerModel.find(filter, { __v: 0 }).sort(sortBy).skip((page - 1) * limit).limit(limit);

            /* Add base URL to customer logos */
            const baseUrl = req.protocol + '://' + req.get('host');

            /* Transform customers to include full logo URLs */
            const customersWithFullLogoUrls = customers.map(customer => {
                const customerObj = customer.toObject();
                if (customerObj?.customer_type === 0) {
                    delete customerObj?.business_name;
                    delete customerObj?.gst_number;
                    delete customerObj?.gst_state_code;
                }
                delete customerObj?.created_at;
                delete customerObj?.updated_at;
                customerObj.customer_logo = baseUrl + '/public/assets/images/customers/' + (customerObj?.customer_logo || 'default.png');
                return customerObj;
            });

            /* Return success response with -filtered customers */
            const message = "All active customers retrieved successfully";

            ResponseService.jsonResponse(200, customersWithFullLogoUrls, res, req, message);
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
     * Creates a new customer
     * 
     * @param req - Request object containing customer data and files
     * @param res - Response object
     * 
     * @description
     * 1. Validates the incoming customer data
     * 2. Generates a new customer ID based on the last customer ID for the 
     * 3. Handles file upload for customer logo
     * 4. Saves the new customer to the database
     * 5. Returns the created customer or an error response
     */

    public static async create(req: any, res: any) {
        try {
            let file: any;
            if (Array.isArray(req.files)) {
                file = req.files.find((f: any) => f.fieldname === 'customer_logo');
            } else {
                file = (req.files as { [fieldname: string]: any })['customer_logo'];
            }

            let filename: any;
            if (file?.originalname) {
                const ext = path.extname(file.originalname);
                filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            }

           

            let rawdata = {
                customer_id: '',
                customer_logo: filename || '',
                customer_type: req.body?.customer_type || 1,
                business_name: req.body?.business_name || '',
                customer_name: req.body?.customer_name || '',
                mobile_number: req.body?.mobile_number || '',
                reward_points: req.body?.reward_points || 0,
                country: req.body?.country || '',
                state: req.body?.state || '',
                city: req.body?.city || '',
                address: req.body?.address || '',
                point_card: req.body?.point_card || '',
                gst_number: req.body?.gst_number || '',
                gst_state_code: req.body?.gst_state_code || '',
                pincode: req.body?.pincode || '',
                notes: req.body?.notes || '',
                created_at: new Date(),
                updated_at: new Date(),
            };

            const data = ValidationService.cleanData(rawdata);
            await new CustomerModel(data).validate();

            const lastCustomer = await CustomerModel.findOne().sort({ customer_id: -1 });
            const lastCustomerId = lastCustomer?.customer_id || 'CLI0000';
            const prefix = lastCustomerId.substring(0, 3);
            let numericSuffix = parseInt(lastCustomerId.slice(3), 10) || 0;

            let newId: string;
            let existingCustomer: any;
            do {
                numericSuffix += 1;
                newId = prefix + numericSuffix.toString().padStart(4, '0');
                existingCustomer = await CustomerModel.findOne({customer_id: newId });
            } while (existingCustomer);

            console.log("Generated customer_id:", newId);
            data.customer_id = newId;

            const customer = new CustomerModel(data);
            await customer.save();

            if (req.files && req.files.length > 0) {
                await UploadService.FileUploader(
                    req,
                    'customer_logo',
                    path.join(__dirname, '../../../../src/public/assets/images/customers'),
                    ['image/jpg', 'image/png', 'image/jpeg'],
                    filename
                );
            }

            return ResponseService.jsonResponse(201, customer, res, null, "Customer created successfully");
        } catch (error: any) {
            console.error("Error creating customer:", error);
            ErrorService.handleError(error, res, req);
        }
    }

    /**
    * Retrieves a specific customer by ID
    * 
    * @param req - Request object containing customer ID in params
    * @param res - Response object
    * 
    * @description
    * 1. Extracts the customer ID from request params
    * 2. Validates that an ID was provided
    * 3. Finds the customer by ID
    * 4. Returns the customer or a not found response
    */
    public static async edit(req: any, res: any) {
        try {
            const customerId = req.params.id;
           
            const baseUrl = req.protocol + '://' + req.get('host')

            /* Only fetch customers with status 1 or 2 (not 0) */
            const customer = await CustomerModel.findOne({
                customer_id: customerId,
                
                status: { $in: [1, 2] }
            }, { __v: 0, created_at: 0, updated_at: 0 });

            /* Validate that customer ID was provided */
            if (!customer) {
                ResponseService.jsonResponse(404, null, res, req, "customer not found");
                return;
            }

            if (customer.customer_type === 0) {
                delete customer?.business_name;
                delete customer?.gst_number;
                delete customer?.gst_state_code;
            }
            if (customer) {
                customer.customer_logo = baseUrl + '/public/assets/images/customers/' + (customer.customer_logo || 'default.png');
                if (!fs.existsSync(path.join(__dirname, '../../../public/assets/images/customers', customer.customer_logo))) {
                    customer.customer_logo = baseUrl + '/public/assets/images/customers/' + 'default.png';
                }
            }

            ResponseService.jsonResponse(200, customer, res, null, "customer fetched successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }


    /**
     * Updates a specific customer
     * 
     * @param req - Request object containing customer ID in params and update data in body
     * @param res - Response object
     * 
     * @description
     * 1. Extracts the customer ID and validates it
     * 2. Finds the customer to update
     * 3. Updates the customer with new data while preserving existing values for unspecified fields
     * 4. Returns the updated customer
     */

    public static async update(req: any, res: any) {
        try {
            const customerId = req.params.id;
           

            /* Find the existing customer */
            const existingCustomer = await CustomerModel.findOne({ customer_id: customerId });
            if (!existingCustomer) {
                return ResponseService.jsonResponse(404, null, res, req, "customer not found");
            }

            /* Handle file upload (customer_logo) */
            let file: any;
            if (Array.isArray(req.files)) {
                file = req.files.find((f: any) => f.fieldname === 'customer_logo');
            } else if (req.files && req.files['customer_logo']) {
                file = req.files['customer_logo'];
            }

            let filename: any;
            if (file?.originalname) {
                const ext = path.extname(file.originalname);
                filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            }

            /* Prepare update data, similar to create */
            const rawdataUpdateData = {
                customer_logo: filename,
                customer_type: req.body?.customer_type,
                business_name: req.body?.business_name,
                customer_name: req.body?.customer_name,
                mobile_number: req.body?.mobile_number,
                reward_points: req.body?.reward_points,
                country: req.body?.country,
                state: req.body?.state,
                city: req.body?.city,
                address: req.body?.address,
                point_card: req.body?.point_card,
                gst_number: req.body?.gst_number,
                gst_state_code: req.body?.gst_state_code,
                notes: req.body?.notes,
                updated_at: new Date()
            };

            let updateData = ValidationService.cleanData(rawdataUpdateData);
            await new CustomerModel(updateData).validate();

            const customer = await CustomerModel.findOneAndUpdate(
                { customer_id: customerId },
                updateData
            );

            if (
                customer &&
                existingCustomer.customer_logo &&
                existingCustomer.customer_logo !== updateData.customer_logo &&
                existingCustomer.customer_logo !== 'default.png'
            ) {
                const oldImagePath = path.join(__dirname, '../../../public/assets/images/customers', existingCustomer.customer_logo);
                if (fs.existsSync(oldImagePath)) {
                    try {
                        fs.unlinkSync(oldImagePath);
                    } catch (err) {
                        console.error('Failed to delete old customer logo:', err);
                    }
                }
            }


            /* Add full image URL to the response */
            if (customer?.customer_logo) {
                const baseUrl = req.protocol + '://' + req.get('host');
                customer.customer_logo = baseUrl + '/public/assets/images/customers/' + (customer.customer_logo || 'default.png');
            }

            ResponseService.jsonResponse(200, customer, res, req, "customer updated successfully");
        } catch (error: any) {
            ErrorService.handleError(error, res, req);
        }
    }


    /**
    * Deletes a specific customer
    * 
    * @param req - Request object containing customer ID in params
    * @param res - Response object
    * 
    * @description
    * 1. Extracts the customer ID and validates it
    * 2. Finds the customer to delete
    * 3. Checks if any products are using this customer
    * 4. Deletes the customer if not in use
    */
    public static async delete(req: any, res: any) {
        try {
            const customerId = req.params.id;
           

            /* Validate that customer ID was provided */
            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: "customer ID is required"
                });
            }

            /* Find the customer to soft delete by ID and  */
            const customer = await CustomerModel.findOne({
                customer_id: customerId,
            });

            /* Return 404 if customer not found */
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "customer not found for this "
                });
            }

            /* Soft delete the customer by updating status to 0 (inactive) */
            const updatedcustomer = await CustomerModel.findOneAndUpdate(
                {
                    customer_id: customerId,
                   
                },
                {
                    status: 0, /* Set to inactive */
                    updated_at: new Date()
                },
                { new: true }
            );

            ResponseService.jsonResponse(200, updatedcustomer, res, req, "customer deactivated successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

}