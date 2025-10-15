import mongoose from "mongoose";
import roleModel from "../Roles/role.model";
import { getDatabase } from "../../../config/database";
getDatabase();


// User model for MongoDB using Mongoose
// To generate this file, use: npx mongoose-gen user

interface IUser extends Document {
    profile_image: any;
    user_id: string;
    username: string;
    full_name: string;
    email: string;
    mobile_number: string;
    password: string;
    role: number;
    mpin: number;
    status: number | null;
    handled_by: string | null;
    created_at: Date;
    updated_at: Date;
    token?: string;
}

/**
 * Represents the schema for a User in the application.
 *
 * @remarks
 * This schema defines the structure and validation rules for user documents
 * stored in the 'users' collection. It includes fields for user identification,
 * authentication, contact information, role association, and status tracking.
 *
 * @property {string} profile_image - Optional. Path or URL to the user's profile image. Must be a jpg, jpeg, or png file.
 * @property {string} user_id - Optional. Unique identifier for the user, max 20 characters.
 * @property {string} username - Required. Unique username for the user.
 * @property {string} full_name - Required. User's full name, between 3 and 60 characters.
 * @property {string} email - Required. Unique email address, validated for proper format.
 * @property {string} mobile_number - Required. Unique mobile number, 8-15 digits, digits only.
 * @property {string} password - Required. User's password, 6-12 characters, must include uppercase, lowercase, number, and special character, or a bcrypt hash.
 * @property {number} role - Required. References the user's role. Must exist in the roles collection.
 * @property {number} mpin - Required. User's MPIN, default is 1234, must be a 4-digit number.
 * @property {number} status - Optional. User's status, either 0 (inactive) or 1 (active). Default is 1.
 * @property {string} handled_by - Optional. Identifier for the user who handled this user record.
 * @property {Date} created_at - Timestamp for when the user was created. Defaults to current date/time.
 * @property {Date} updated_at - Timestamp for when the user was last updated. Defaults to current date/time.
 *
 * @details
 * - The schema enforces uniqueness on user_id, username, email, and mobile_number.
 * - Passwords are validated for strength or accepted as bcrypt hashes.
 * - Role and  references are validated for existence and active status.
 * - The collection name is explicitly set to 'users'.
 */
const userSchema = new mongoose.Schema({
    /*    * Profile image URL or path, optional.
     * Must be a valid jpg, jpeg, or png file.
     */
    profile_image: {
        type: String,
        validate: {
            validator: function (value: any) {
                if (!value) return true;
                return /\.(jpg|jpeg|png)$/i.test(value);
            },
            message: "Profile image must be a file of type jpg, jpeg, or png.",
        },
    },
    /* User ID, optional. Must be unique, max 20 characters. */
    user_id: {
        type: String,
        required: [false, "User ID is optional."],
        unique: true,
        trim: true,
        max: [20, "User ID must be at most 20 characters."],
    },
    /* Username, required. Must be unique. */
    username: {
        type: String,
        required: [true, "Username is required."],
        unique: true,
    },
    /* Full name, required. Must be between 3 and 60 characters. */
    full_name: {
        type: String,
        required: [true, "Full name is required."],
        trim: true,
        max: [60, "Full name must be at most 60 characters."],
        min: [3, "Full name must be at least 3 characters."],
    },
    /* Email, required. Must be unique and valid format. */
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "Email is required."],
        unique: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please enter a valid email address.",
        ],
    },
    /* Mobile number, required. Must be unique, 8-15 digits, digits only. */
    mobile_number: {
        type: String,
        required: [true, "Mobile number is required."],
        unique: true,
        min: [8, "Mobile number must be at least 8 digits."],
        max: [15, "Mobile number must be at most 15 digits."],
        match: [
            /^[0-9]+$/,
            "Mobile number must contain only digits.",
        ],
    },
    /* Password, required. Must be 6-12 characters, include uppercase, lowercase, number, and special character, or a bcrypt hash. */
    /* If bcrypt hash, it should match the format: $2[aby]$[salt][hash] */
    password: {
        type: String,
        required: [true, "Password is required."],
        min: [6, "Password must be at least 6 characters."],
        max: [12, "Password must be at most 12 characters."],
        validate: {
            validator: function (value: string) {
                if (/^\$2[aby]\$.{56}$/.test(value)) {
                    return true;
                }
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,12}$/.test(value);
            },
            message:
                "Password must be 6-12 characters and include uppercase, lowercase, number, and special character.",
        },
    },
    /* Role, required. Must exist in the roles collection. */
    /* Default is 1 (admin). */
    role: {
        type: Number,
        required: [true, "Role is required."],
        default: 1,
        ref: "Role",
        validate: {
            validator: async function (value: number) {
                const RoleModel = roleModel;
                const role = await RoleModel.findOne({ role_id: value, status: 1 });
                return !!role;
            },
            message: "Role does not exist in roles collection.",
        },
    },
    /* MPIN, required. Default is 1234, must be a 4-digit number. */
    /* MPIN is optional, but if provided, it must be a 4-digit number. */
    /* MPIN is used for quick access or authentication. */
    mpin: {
        type: Number,
        required: [true, "MPIN is optional."],
        default: 1234,
        min: [4, "MPIN must be a 4-digit number."],
    },
    /* Status, optional. Default is 1 (active), can be 0 (inactive) or 1 (active). */
    /* Status indicates whether the user is active or inactive. */
    status: {
        type: Number,
        required: [false, "Status is optional."],
        default: 1,
        enum: [0, 1, 2],  /* 0: Archived, 1: Active, 2: Inactive */
    },
    /* Handled By, optional. Identifier for the user who handled this user record. */
    /* This field can be used to track who created or modified the user record. */
    handled_by: {
        type: String,
        required: [false, "Handled By is optional."],
    },
    /* Timestamps for creation and last update */
    created_at: {
        type: Date,
        default: Date.now,
    },
    /* Last updated timestamp */
    /* This field is automatically updated whenever the user record is modified. */
    updated_at: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: 'users',  /* 👈 custom collection name */
});


const userModel = mongoose.model<IUser>('User', userSchema);
export default userModel;