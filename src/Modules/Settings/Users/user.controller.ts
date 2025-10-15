import userModel from './user.model';
import { ErrorService } from '../../../Services/ErrorService';
import { UploadService } from '../../../Services/UploadService';
import { ResponseService } from '../../../Services/ResponseService';
import path from 'path';
const bcrypt = require('bcryptjs');

/**
 * @description Users controller for managing  users.
 * Provides methods to list, create, edit, update, and delete users.
 * Handles user data aggregation, role information, and profile image management.
 */

export class Users {

    /**
     * List all users for a  with role and handled_by info.
     * Aggregates user data, joins with roles and handled_by user,
     * and constructs profile image URLs.
     */
    public static async list(req: any, res: any) {
        try {
            const baseUrl = req.protocol + '://' + req.get('host');

            /**
             * @description Retrieves a list of all users for the specified .
             * The list includes user details, role information, and the user who handled the creation.
             * It aggregates user data, joins with the roles collection to get role names,
             * and constructs profile image URLs based on the provided base URL.
             */
            const users = await userModel.aggregate([
                {
                    $match: {  status: { $in: [1, 2] } }
                },
                {
                    $lookup: {
                        from: 'roles',
                        localField: 'role',
                        foreignField: 'role_id',
                        as: 'role_info'
                    }
                },
                {
                    $unwind: {
                        path: '$role_info',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        role_name: '$role_info.name'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'handled_by',
                        foreignField: 'user_id',
                        as: 'handled_by_user'
                    }
                },
                {
                    $addFields: {
                        handled_by_full_name: {
                            $arrayElemAt: ['$handled_by_user.full_name', 0]
                        },
                        profile_image_url: {
                            $cond: {
                                if: { $ne: ['$profile_image', ''] },
                                then: {
                                    $concat: [
                                        baseUrl,
                                        '/public/assets/images/users/',
                                        '$profile_image'
                                    ]
                                },
                                else: ''
                            }
                        }
                    }
                },
                {
                    $project: {
                        role_info: 0,
                        handled_by_user: 0
                    }
                },
                {
                    $sort: { user_id: 1 }
                }
            ]);

            ResponseService.jsonResponse(200, users, res, null, "Users retrieved successfully");
        } catch (error) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
     * Create a new user for a .
     * - Validates input data.
     * - Generates a unique user_id (e.g., HTU0001).
     * - Hashes the password.
     * - Handles profile image upload if provided.
     * - Saves the user to the database.
     * - Returns the created user or validation errors.
     */
    public static async create(req: any, res: any) {
        try {
            /*  Prepare user data from request body */

            let file: any;
            if (req.files) {
                if (Array.isArray(req.files)) {
                    file = req.files.find((f: any) => f.fieldname === 'profile_image');
                } else {
                    /*  If req.files is an object, access by fieldName */
                    file = (req.files as { [fieldname: string]: any })['profile_image'];
                }
            }

            let filename: any;
            if (file?.originalname) {
                const ext = path.extname(file.originalname);
                filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            }

            /*  Prepare user data */
            const data = {
                profile_image: file?.originalname || '',
                user_id: '',
                handled_by: req.body?.user_id,
                username: req.body?.username,
                full_name: req.body?.full_name,
                mobile_number: req.body?.mobile_number,
                email: req.body?.email,
                role: req.body?.role,
                password: req.body?.password,
                created_at: new Date(),
                updated_at: new Date(),
                status: 1
            }

            /*   Validate user data */
            const tempUser = new userModel(data);

            try {
                await tempUser.validate();
            } catch (validationError) {
                console.error("Validation error:", file);
                ErrorService.handleError(validationError, res, req);
                return;
            }

            /* Generate new unique user_id */
            const lastuser = await userModel.findOne({}).sort({ user_id: -1 });

            let lastUser;
            if (!lastuser) {
                lastUser = 'HTU0000';
            } else {
                lastUser = lastuser.user_id;
            }

            let newId: string;
            let exitUser: any;

            let numericSuffix = parseInt(lastUser.substring(3), 10) || 0;
            const prefix = lastUser.substring(0, 3);
            do {
                numericSuffix += 1;
                const paddingLength = Math.max(4 - String(numericSuffix).length, 0);
                const paddedSuffix = numericSuffix.toString().padStart(paddingLength + String(numericSuffix).length, '0');
                newId = prefix + paddedSuffix;
                exitUser = await userModel.findOne({ user_id: newId });
            } while (exitUser);

            data.user_id = newId;

            /* Hash the password */
            data.password = await bcrypt.hash(req.body.password, 10);

            /*  Handle profile image upload if provided */
            if (data.profile_image) {
                const upload = await UploadService.FileUploader(
                    req,
                    'profile_image',
                    '../public/assets/images/users',
                    ['image/jpg', 'image/png', 'image/jpeg'],
                    filename
                );

                data.profile_image = upload.filename;
            }

            /* Save the new user to the database */
            const user = new userModel(data);
            await user.save();

            /* Send success response */
            ResponseService.jsonResponse(201, user, res, req, "User created successfully");

        } catch (error: any) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
     * Retrieve a single user by ID.
     * - Finds the user by MongoDB _id.
     * - Prepends the profile image URL if present.
     * - Returns 404 if user not found.
     */
    public static async edit(req: any, res: any) {
        try {
            /* Find user by ID */
            const user = await userModel.findById(req.params.id);

            /* If user not found, return 404 */
            if (!user || user.status === 0) {
                return ResponseService.jsonResponse(404, null, res, null, "User not found");
            }

            /* If user has a profile image, prepend the base URL */
            if (user?.profile_image) {
                const baseUrl = req.protocol + '://' + req.get('host');
                user.profile_image = baseUrl + '/public/assets/images/users/' + user.profile_image;
            }

            /* Send success response with user data */
            ResponseService.jsonResponse(200, user, res, null, "User retrieved successfully");
        } catch (error) {
            /*  Handle errors */
            ErrorService.handleError(error, res, req);
        }
    }
    /**
     * Update an existing user.
     * - Validates input data.
     * - Handles profile image upload if provided.
     * - Updates the user in the database.
     * - Returns the updated user or validation errors.
     */
    public static async update(req: any, res: any) {
        try {
            /* Find the user by ID */
            const user = await userModel.findById(req.params.id);
            if (!user || user.status === 0) {
                /* If user not found or already deleted, return 404 */
                return ResponseService.jsonResponse(404, null, res, null, "User not found");
            }

            let file: any;
            if (req.files) {
                if (Array.isArray(req.files)) {
                    file = req.files.find((f: any) => f.fieldname === 'profile_image');
                } else {
                    /*  If req.files is an object, access by fieldName */
                    file = (req.files as { [fieldname: string]: any })['profile_image'];
                }
            }

            let filename: any;
            if (file?.originalname) {
                const ext = path.extname(file.originalname);
                filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            }

            /* Prepare updated data */
            const data: any = {
                full_name: req.body?.full_name ?? user.full_name,
                mobile_number: req.body?.mobile_number ?? user.mobile_number,
                email: req.body?.email ?? user.email,
                role: req.body?.role ?? user.role,
                updated_at: new Date(),
                profile_image: file?.originalname ?? user.profile_image
            };

            /* Validate updated data */
            const tempUser = new userModel({ ...user.toObject(), ...data });
            try {
                await tempUser.validate();
            } catch (validationError) {
                ErrorService.handleError(validationError, res, req);
                return;
            }

            /* Handle profile image upload if provided */
            if (file) {
                const upload = await UploadService.FileUploader(
                    req,
                    'profile_image',
                    '../public/assets/images/users',
                    ['image/jpg', 'image/png', 'image/jpeg'],
                    filename
                );
                data.profile_image = upload.filename;
            }

            /* Update user in database */
            await userModel.findByIdAndUpdate(req.params.id, data, { new: true });

            /* Fetch updated user */
            const updatedUser = await userModel.findById(req.params.id);

            /* Prepend profile image URL if present */
            if (updatedUser?.profile_image) {
                const baseUrl = req.protocol + '://' + req.get('host');
                updatedUser.profile_image = baseUrl + '/public/assets/images/users/' + updatedUser.profile_image;
            }

            ResponseService.jsonResponse(200, updatedUser, res, req, "User updated successfully");
        } catch (error: any) {
            ErrorService.handleError(error, res, req);
        }
    }

    /**
     * Delete a user by ID.
     * - Soft deletes the user by setting status to 0.
     * - Returns 404 if user not found.
     */
    public static async delete(req: any, res: any) {
        try {
            /* Find the user by ID */
            const user = await userModel.findById(req.params.id);

            if (!user || user.status === 0) {
                /* If user not found or already deleted, return 404 */
                return ResponseService.jsonResponse(404, null, res, null, "User not found");
            }

            /* Soft delete: set status to 0 */
            await userModel.findByIdAndUpdate(req.params.id, { status: 0, updated_at: new Date() });

            ResponseService.jsonResponse(200, null, res, req, "User deleted successfully");
        } catch (error: any) {
            ErrorService.handleError(error, res, req);
        }
    }
}
