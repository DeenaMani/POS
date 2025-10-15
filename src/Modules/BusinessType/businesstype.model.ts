import mongoose from 'mongoose';

interface IBusinessType extends mongoose.Document {
    business_type_name: string;
    handled_by: string;
    status: number;
    created_at: Date;
    updated_at: Date;
}

/**
 * Represents the schema for a Business Type in the application.
 *
 * @remarks
 * This schema defines the structure and validation rules for business type documents
 * stored in the 'business_types' collection. It includes fields for business type identification,
 * naming, ownership, and status tracking.
 *
 * @property {number} business_type_id - Optional. Unique numeric identifier for the business type within a .
 * @property {string} business_type_name - Required. Globally unique name for the business type, between 2 and 50 characters.
 * @property {string} handled_by - Optional. Identifier for the user who handled this business type record.
 * @property {number} status - Optional. Business type status, either 0 (inactive) or 1 (active). Default is 1.
 * @property {Date} created_at - Timestamp for when the business type was created. Defaults to current date/time.
 * @property {Date} updated_at - Timestamp for when the business type was last updated. Defaults to current date/time.
 *
 * @details
 * - The schema enforces global uniqueness on category_name (case-insensitive).
 * - Categories can be associated with specific s but are not required to be.
 * - The collection name is explicitly set to 'product_categories'.
 */
const businessTypeSchema = new mongoose.Schema({
    /* Business Type ID, optional. Unique numeric identifier within a . */
    business_type_id: {
        type: Number,
        required: false,
        default: null
    },

    /* Business Type name, required. Must be globally unique and between 2-50 characters. */
    business_type_name: {
        type: String,
        required: [true, "Business Type name is required"],
        trim: true,
        max: [60, "Business Type name must be at most 60 characters."],
        min: [3, "Business Type name must be at least 3 characters."],
    },

    /* Handled By, optional. Identifier for the user who handled this category record. */
    handled_by: {
        type: String,
        required: false,
        trim: true
    },

    /* Status, optional. Default is 1 (active), can be 0 (inactive) or 1 (active). */
    status: {
        type: Number,
        default: 1,
        enum: [0, 1, 2],
        comment: "0: Deleted, 1: Active , 2: Inactive"
    },

    /* Timestamp for creation */
    created_at: {
        type: Date,
        default: Date.now
    },

    /* Timestamp for last update */
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'business_types',  /* 👈 custom collection name */
});


const BusinessTypeModel = mongoose.model<IBusinessType>('BusinessType', businessTypeSchema);
export default BusinessTypeModel;
