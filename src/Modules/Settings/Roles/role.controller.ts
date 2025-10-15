import roleModel from './role.model';
import userModel from '../../Settings/Users/user.model';
import { ErrorService } from '../../../Services/ErrorService';
import { ResponseService } from '../../../Services/ResponseService';

/**
 * @description Roles controller for managing  roles.
 * Provides methods to list, create, edit, update, and delete roles.
 * Handles role data aggregation and validation.
 */

export class Roles {
    /**
     * @description List all roles sorted by role_id.
     */
    public static async list(req: { body: any; }, res: any) {
        try {
            const roles = await roleModel.find({ status: { $ne: 0 } }).sort({ role_id: 1 });
            if (!roles || roles.length === 0) {
                /* No roles found, return empty response */
                return ResponseService.jsonResponse(404, null, res, req, "No roles found", false);
            }
            ResponseService.jsonResponse(200, roles, res, req, "Roles retrieved successfully", true);
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * @description Create a new role with validation.
     */
    public static async create(req: { body: any; }, res: any) {
        try {
            // Prepare role data
            const data: {
                name: any;
                status: any;
                created_at: Date;
                updated_at: Date;
                role_id?: number;
            } = {
                name: req.body.name,
                status: req.body.status ?? 1,
                created_at: new Date(),
                updated_at: new Date()
            };

            /* Validate data before assigning role_id or saving */
            const tempRole = new roleModel(data);
            try {
                await tempRole.validate();
            } catch (validationError) {
                ErrorService.handleError(validationError, res, req);
                return;
            }

            /* Assign next role_id after validation */
            const lastRole = await roleModel.findOne({}).sort({ role_id: -1 });
            data.role_id = (lastRole?.role_id ?? 0) + 1;

            /* Save the validated role */
            const role = new roleModel(data);
            await role.save();

            ResponseService.jsonResponse(201, role, res, req, "Role created successfully", true);
        } catch (error: any) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * @description Edit (fetch for edit) a role by role_id.
     */
    public static async edit(req: { params: { id: string } }, res: any) {
        try {
            const role = await roleModel.findById(req.params.id);
            if (!role || role.status === 0) {
                /* Role not found or deleted */
                return ResponseService.jsonResponse(404, null, res, req, "Role not found", false);
            }
            ResponseService.jsonResponse(200, role, res, req, "Role data for edit retrieved successfully", true);
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * @description Update a role by role_id.
     */
    public static async update(req: { params: { id: string }, body: any }, res: any) {
        try {

            /* Find the user by ID */
            const role = await roleModel.findById(req.params.id);

            if (!role || role.status === 0) {
                /* Role not found or deleted */
                return ResponseService.jsonResponse(404, null, res, req, "Role not found", false);
            }

            /* Prepare updated data */
            const data: any = {
                name: req.body?.name ?? role.name,
                status: req.body?.status ?? role.status,
                updated_at: new Date()
            };

            /* Validate updated data */
            const tempRole = new roleModel({ ...role.toObject(), ...data });
            try {
                await tempRole.validate();
            } catch (validationError) {
                ErrorService.handleError(validationError, res, req);
                return;
            }

            if (await userModel.exists({ role: role.role_id }) && data.status == 0) {
                /* If there are users with this role, prevent deletion */
                return ResponseService.jsonResponse(400, null, res, req, "Cannot delete role with existing users", false);
            }


            /* Update the role */
            const updatedRole = await roleModel.findOneAndUpdate(
                { role_id: Number(req.params.id) },
                data,
                { new: true, runValidators: true }
            );

            ResponseService.jsonResponse(200, updatedRole, res, req, "Role updated successfully", true);
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * @description Delete a role by role_id.
     */
    public static async delete(req: { params: { id: string } }, res: any) {
        try {
            const role = await roleModel.findById(req.params.id);
            if (!role || role.status === 0) {
                /* Role not found or already deleted */
                return ResponseService.jsonResponse(404, null, res, req, "Role not found", false);
            }
            /* Soft delete the role by setting status to 0 */
            /* This allows for potential recovery or auditing later */

            if (await userModel.exists({ role: role.role_id })) {
                /* If there are users with this role, prevent deletion */
                return ResponseService.jsonResponse(400, null, res, req, "Cannot delete role with existing users", false);
            }

            if (await roleModel.countDocuments({ status: 0 }) >= 100) {
                /* If there are already 100 soft-deleted roles, prevent further deletion */
                return ResponseService.jsonResponse(400, null, res, req, "Cannot delete role. Maximum soft-deleted roles reached.", false);

            }
            role.status = 0;
            role.updated_at = new Date();
            await role.save();
            ResponseService.jsonResponse(200, null, res, req, "Role deleted successfully", true);
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }
}
