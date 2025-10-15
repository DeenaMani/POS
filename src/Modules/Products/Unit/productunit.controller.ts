import ProductUnitModel from './productunit.model';
import productModel from '../Product/product.model';
import { ResponseService } from '../../../Services/ResponseService';
import { ErrorService } from '../../../Services/ErrorService';

export class ProductUnitController {

    /**
     * Lists active product units for a specific 
     */
    public static async list(req: any, res: any) {
        try {

            const status = req.body?.list_type == 0 ? [1, 2] : [1];
            const units = await ProductUnitModel.find({
                
                status: { $in: status }
            }, {
                unit_id: 1,
                unit_name: 1,
                _id: 0,
            }).sort({ unit_id: 1 });

            ResponseService.jsonResponse(
                200,
                units,
                res,
                req,
                `Active units for  ${req.headers['']} retrieved successfully`
            );
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * Creates a new product unit
     */
    public static async create(req: any, res: any) {
        try {
           

            const data = {
                unit_id: 0,
                
                unit_name: req.body.unit_name,
                handled_by: req.headers['user_id'],
                status: req.body.status || 1,
                created_at: new Date(),
                updated_at: new Date(),
            };

            await new ProductUnitModel(data).validate();

            const lastUnit = await ProductUnitModel.findOne().sort({ unit_id: -1 });

            let newUnitId = 1;
            if (lastUnit) {
                newUnitId = Number(lastUnit?.unit_id || 0) + 1;
            }

            data.unit_id = newUnitId;

            const unit = new ProductUnitModel(data);
            await unit.save();

            ResponseService.jsonResponse(201, unit, res, req, "Unit created successfully");
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

            ErrorService.handleError(error, res, req);
            return;
        }
    }
    /**
     * Retrieves a specific unit by ID for the current 
     */
    public static async edit(req: any, res: any) {
        try {
            const unitId = req.params.id;
           

            const unit = await ProductUnitModel.findOne({
                unit_id: unitId,
               
            });

            if (!unit) {
                return ResponseService.jsonResponse(404, null, res, null, "Unit not found");
            }

            ResponseService.jsonResponse(200, unit, res, req, "Unit retrieved successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * Updates a specific unit for the current 
     */
    public static async update(req: any, res: any) {
        try {

            const data = {
                unit_name: req.body.unit_name,
                handled_by: req.headers['user_id'],
                status: req.body?.status,
                updated_at: new Date()
            };

            await new ProductUnitModel({ ...data, unit_id: req.params.id }).validate();

            if (req.body.status === 2 && await productModel.exists({ unit: req.params.id,  status: { $ne: 0 } })) {
                return ResponseService.jsonResponse(400, null, res, null, "Cannot change unit status to inactive because it is associated with products");
            }

            const updatedUnit = await ProductUnitModel.findOneAndUpdate(
                { unit_id: req.params.id },
                data,
                { new: true, runValidators: true }
            );

            ResponseService.jsonResponse(200, updatedUnit, res, req, "Unit updated successfully");
            return;
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
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * Soft deletes a specific unit for the current 
     */
    public static async delete(req: any, res: any) {
        try {

            /*  Check if the unit is used by any active products */
            if (await productModel.exists({ unit: req.params.id,  status: 1 })) {
                return ResponseService.jsonResponse(400, null, res, null, "Cannot delete unit because it is used by active products");
            }
            const unit = await ProductUnitModel.findOneAndDelete({ unit_id: req.params.id,  status: 1 });
            if (!unit) {
                return res.status(404).json({ message: 'Unit not found or already deleted' });
            }
            ResponseService.jsonResponse(200, unit, res, req, "Unit Deleted successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }
}
