/**
 * Product Category Controller
 * 
 * This module provides controller methods for CRUD operations on product categories.
 * It handles creating, retrieving, updating and deleting product categories.
 */

import categoryModel from './category.model';
import productModel from '../Product/product.model';
import { ResponseService } from '../../../Services/ResponseService';
import { ErrorService } from '../../../Services/ErrorService';

export class ProductCategory {


    /**
     * Lists active product categories for a specific 
     * 
     * @param req - Request object containing  in headers
     * @param res - Response object
     * 
     * @description
     * Retrieves active categories (status 1) for the specified  sorted by category_id
     * Returns them in the response
     */
    public static async list(req: any, res: any) {
        try {

            const status = req.body?.list_type == 0 ? [1, 2] : [1];
            const categories = await categoryModel.find({
                
                status: { $in: status }
            }).sort({ category_id: 1 });

            ResponseService.jsonResponse(200, categories, res, req, `Active categories for  ${req.headers['']} retrieved successfully`);
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * Creates a new product category
     * 
     * @param req - Request object containing category data
     * @param res - Response object
     * 
     * @description
     * 1. Validates the incoming category data
     * 2. Finds the last category ID for the specific  to generate a -specific sequential ID
     * 3. Saves the new category to the database
     * 4. Returns the created category
     */
    public static async create(req: any, res: any) {
        try {
            // Get the  ID from headers
           

            // Prepare initial data for validation
            const data = {
                category_id: 0, // Placeholder, will be updated later
                
                category_name: req.body.category_name,
                handled_by: req.headers['user_id'],
                status: req.body.status || 1, // Default to active status
                created_at: new Date(),
                updated_at: new Date(),
            }

            // Validate the data before generating an ID
            await new categoryModel(data).validate();

            // Generate a new sequential category ID for this specific  only
            const lastCategory = await categoryModel.findOne(
                { }
            ).sort({ category_id: -1 });

            // Start from 1 for each 
            let newCategoryId = 1;
            if (lastCategory && lastCategory.category_id) {
                newCategoryId = Number(lastCategory.category_id) + 1;
            }

            // Prepare the complete category data with the new ID
            data.category_id = newCategoryId;

            // Create and save the category
            const category = new categoryModel(data);
            await category.save();

            // Return success response
            ResponseService.jsonResponse(201, category, res, req, "Category created successfully");

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
 * Retrieves a specific category by ID for the current 
 * 
 * @param req - Request object containing category ID in params and  in headers
 * @param res - Response object
 * 
 * @description
 * 1. Extracts the category ID from request params and  ID from headers
 * 2. Validates that both IDs were provided
 * 3. Finds the category by ID and 
 * 4. Returns the category or a not found response
 */
    public static async edit(req: any, res: any) {
        try {
            const categoryId = req.params.id;
           

            // Find the category by ID and 
            const category = await categoryModel.findOne({
                category_id: categoryId,
               
            });

            // Return 404 if category not found
            if (!category) {
                return ResponseService.jsonResponse(404, null, res, null, "Category not found");
            }

            // Return success response with category
            ResponseService.jsonResponse(200, category, res, req, "Category retrieved successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
   * Updates a specific category for the current 
   * 
   * @param req - Request object containing category ID in params,  in headers, and update data in body
   * @param res - Response object
   * 
   * @description
   * 1. Extracts the category ID and  ID
   * 2. Validates that both IDs are provided
   * 3. Finds the category to update by ID and 
   * 4. Checks if category is used by products when trying to change status
   * 5. Updates the category with new data while preserving existing values for unspecified fields
   * 6. Returns the updated category
   */
    public static async update(req: any, res: any) {
        try {
            const categoryId = req.params.id;
           
            const userId = req.headers['user_id'];

            // Find the category to update by ID and 
            const category = await categoryModel.findOne({
                category_id: categoryId,
               
            });

            // Return 404 if category not found
            if (!category) {
                return ResponseService.jsonResponse(404, null, res, null, "Category not found");
            }

            // Check if trying to update status to 2
            if (req.body.status === 2) {
                // Check if any products are using this category
                const productsUsingCategory = await productModel.countDocuments({
                    category: categoryId,
                   
                });

                if (productsUsingCategory > 0) {
                    return ResponseService.jsonResponse(400, null, res, null, "Cannot change category status to inactive because it is used by products");
                }
            }

            // Prepare update data, preserving existing values for unspecified fields
            const updateData = {
                 // Preserve  ID
                category_name: req.body.category_name || category.category_name,
                handled_by: userId || category.handled_by,
                status: req.body.status || category.status, // Preserve existing status if not provided
                updated_at: new Date()
            };

            // Add status to updateData if provided in request
            if (req.body.status !== undefined) {
                updateData.status = req.body.status;
            }

            // Update the category by category_id and 
            const updatedCategory = await categoryModel.findOneAndUpdate(
                {
                    category_id: categoryId,
                   
                },
                updateData,
                { new: true, runValidators: true }
            );

            // Return success response with updated category
            ResponseService.jsonResponse(200, updatedCategory, res, req, "Category updated successfully");
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
   * Soft deletes a specific category for the current 
   * 
   * @param req - Request object containing category ID in params and  in headers
   * @param res - Response object
   * 
   * @description
   * 1. Extracts the category ID and  ID
   * 2. Validates that both IDs are provided
   * 3. Finds the category to delete by ID and 
   * 4. Checks if any active products are using this category
   * 5. Soft deletes the category by setting status to 0 (inactive)
   * 6. Returns a success response
   */
    public static async delete(req: any, res: any) {
        try {
            const categoryId = req.params.id;
           

            // Find the category to soft delete by ID and 
            const category = await categoryModel.findOne({
                category_id: categoryId,
               
            });

            // Return 404 if category not found
            if (!category) {
                return ResponseService.jsonResponse(404, null, res, null, "Category not found");
            }

            // Check if any active products are using this category within this 
            const productsUsingCategory = await productModel.countDocuments({
                category: categoryId,
                
                status: 1  // Only count active products
            });

            if (productsUsingCategory > 0) {
                return ResponseService.jsonResponse(400, null, res, null, "Cannot delete category because it is used by active products");

            }

            const deletedCategory = await categoryModel.findOneAndDelete(
                {
                    category_id: categoryId,
                }
            );
            // Return success response
            ResponseService.jsonResponse(200, deletedCategory, res, req, "Category deactivated successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }
}