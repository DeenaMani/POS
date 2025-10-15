import mongoose, { Document, Schema } from "mongoose";
/**
 * Role model interface
 * - Represents a role in the system with properties like role_id, name, status, created_at, and updated_at.
 * * @interface IRole
 * @extends Document
 */
interface IRole extends Document {
    role_id: number | null;
    name: string;
    status: number | null;
    created_at: Date;
    updated_at: Date;
}


/**
 * Role schema definition
 * - Defines the structure and validation rules for role documents stored in the 'roles' collection.
 * * @remarks
 * This schema includes fields for role identification, name, status, and timestamps for creation and updates.
 * * @property {number} role_id - Optional. Unique identifier for the role, auto-incremented.
 * * @property {string} name - Required. Unique name for the role, must be between 3 and 50 characters.
 * * @property {number} status - Optional. Role's status, either 0 (inactive) or 1 (active). Default is 1.
 * * @property {Date} created_at - Timestamp for when the role was created. Defaults to current date/time.
 * * @property {Date} updated_at - Timestamp for when the role was last updated. Defaults to current date/time.
 * * @details
 * - The schema enforces uniqueness on the role name.
 * - The role_id is optional and can be used for custom role identification.
 * * - The collection name is explicitly set to 'roles'.
 */
const roleSchema = new Schema<IRole>(
    {
        /**
         * Unique identifier for the role, auto-incremented.
         * This field is optional and can be used for custom role identification.
         */
        role_id: {
            type: Number,
            unique: true,
        },
        /**
         * Unique name for the role within the same .
         * This field is required and must be between 3 and 50 characters.
         */
        name: {
            type: String,
            required: [true, "Role name is required."],
            minlength: 3,
            maxlength: 50,
        },
        /**
         * Role's status, either 0 (Archived) or 1 (active) or 2 (Inactive).
         * This field defaults to 1 (active).
         */
        status: {
            type: Number,
            default: 1,
            enum: [0, 1, 2], // 0: Archived, 1: Active, 2: Inactive
        },
        /**
         * Timestamp for when the role was created.
         * This field defaults to the current date/time.
         */
        created_at: {
            type: Date,
            default: Date.now,
        },
        /**
         * Timestamp for when the role was last updated.
         * This field defaults to the current date/time.
         */
        updated_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: "roles", /* Explicitly set the collection name to 'roles' */
    }
);

roleSchema.index({ name: 1 }, { unique: true });
const roleModel = mongoose.model<IRole>("Role", roleSchema);
export default roleModel;