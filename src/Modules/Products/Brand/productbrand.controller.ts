import ProductBrandModel from './productbrand.model';
import productModel from '../Product/product.model';
import { ResponseService } from '../../../Services/ResponseService';
import { ErrorService } from '../../../Services/ErrorService';

export class ProductBrandController {

    /**
     * Lists active product brands for a specific 
     */
    public static async list(req: any, res: any) {
        try {

            const status = req.body?.list_type == 0 ? [1, 2] : [1];
            const brands = await ProductBrandModel.find({
                status: { $in: status }
            }, {
                brand_id: 1,
                brand_name: 1,
                _id: 0,
            }).sort({ brand_id: 1 });

            ResponseService.jsonResponse(
                200,
                brands,
                res,
                req,
                `Active brands  retrieved successfully`
            );
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * Creates a new product brand
     */
    public static async create(req: any, res: any) {
        try {
            const data = {
                brand_id: 0,
                brand_name: req.body.brand_name,
                handled_by: req.headers['user_id'],
                status: req.body.status || 1,
                created_at: new Date(),
                updated_at: new Date(),
            };

            await new ProductBrandModel(data).validate();

            const lastBrand = await ProductBrandModel.findOne().sort({ brand_id: -1 });

            let newBrandId = 1;
            if (lastBrand) {
                newBrandId = Number(lastBrand?.brand_id || 0) + 1;
            }

            data.brand_id = newBrandId;

            const brand = new ProductBrandModel(data);
            await brand.save();

            ResponseService.jsonResponse(201, brand, res, req, "Brand created successfully");
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
     * Retrieves a specific brand by ID for the current 
     */
    public static async edit(req: any, res: any) {
        try {
            const brandId = req.params.id;
           

            const brand = await ProductBrandModel.findOne({
                brand_id: brandId,
               
            });

            if (!brand) {
                return ResponseService.jsonResponse(404, null, res, null, "Brand not found");
            }

            ResponseService.jsonResponse(200, brand, res, req, "Brand retrieved successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * Updates a specific brand for the current 
     */
    public static async update(req: any, res: any) {
        try {

            const data = {
                brand_name: req.body.brand_name,
                handled_by: req.headers['user_id'],
                status: req.body?.status,
                updated_at: new Date()
            };

            await new ProductBrandModel({ ...data, brand_id: req.params.id }).validate();

            if (req.body.status === 2 && await productModel.exists({ brand: req.params.id, status: { $ne: 0 } })) {
                return ResponseService.jsonResponse(400, null, res, null, "Cannot change brand status to inactive because it is associated with products");
            }

            const updatedBrand = await ProductBrandModel.findOneAndUpdate(
                { brand_id: req.params.id },
                data,
                { new: true, runValidators: true }
            );

            ResponseService.jsonResponse(200, updatedBrand, res, req, "Brand updated successfully");
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
     * Soft deletes a specific brand for the current 
     */
    public static async delete(req: any, res: any) {
        try {

            /*  Check if the brand is used by any active products */
            if (await productModel.exists({ brand: req.params.id,  status: 1 })) {
                return ResponseService.jsonResponse(400, null, res, null, "Cannot delete brand because it is used by active products");
            }
            const brand = await ProductBrandModel.findOneAndDelete({ brand_id: req.params.id });
            if (!brand) {
                return res.status(404).json({ message: 'Brand not found or already deleted' });
            }
            ResponseService.jsonResponse(200, brand, res, req, "Brand Deleted successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }
}
