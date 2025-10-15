import mongoose from 'mongoose';

interface ITaxSettings extends mongoose.Document {
    tax_id: number;
    tax: Array<string>;
    status: number;
    created_at: Date;
    updated_at: Date;
}
/**
 * Represents the schema for Tax Settings in the application.
 *
 * @remarks
 * This schema defines the structure and validation rules for tax settings documents
 * stored in the 'tax_settings' collection. It includes fields for tax settings identification,
 * tax array, ownership, and status tracking.
 *
 * @property {string}  - Optional. Identifier for the  this tax setting belongs to.
 * @property {number} tax_id - Optional. Unique numeric identifier for the tax setting within a .
 * @property {Array<string>} tax - Required. Array of tax names or values.
 * @property {string} handled_by - Optional. Identifier for the user who handled this tax setting record.
 * @property {number} status - Optional. Tax setting status: 0 (Deleted), 1 (Active), 2 (Inactive). Default is 1.
 * @property {Date} created_at - Timestamp for when the tax setting was created. Defaults to current date/time.
 * @property {Date} updated_at - Timestamp for when the tax setting was last updated. Defaults to current date/time.
 *
 * @details
 * - The schema allows association with specific s but is not required.
 * - The collection name is explicitly set to 'tax_settings'.
 */
const taxSettingsSchema = new mongoose.Schema({
    /* ID, optional. Unique numeric identifier for the tax setting within a . */
    tax_id: {
        type: Number,
        required: false,
        unique: true,
        trim: true,
        default: null
    },

    /* Tax, required. Array of tax names or values. */
    tax: {
        type: Array<string>,
        required: [true, "Tax is required"],
        trim: true,
    },

    /* Handled By, optional. Identifier for the user who handled this tax setting record. */
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
    collection: 'tax_settings',  /* 👈 custom collection name */
});

interface IGstStateCode extends mongoose.Document {
    id?: string;
    code: string;
    status: number;
    created_at: Date;
    updated_at: Date;
}
/**
 * Represents the schema for GST State Codes in the application.
 *
 * @remarks
 * This schema defines the structure and validation rules for GST state code documents
 * stored in the 'gst_state_codes' collection. It includes fields for code, status, and timestamps.
 *
 * @property {string} id - Optional. Unique identifier for the GST state code.
 * @property {number} code - Required. Numeric code representing the GST state.
 * @property {number} status - Required. Status of the GST state code: 0 (Deleted), 1 (Active), 2 (Inactive).
 * @property {Date} created_at - Timestamp for when the GST state code was created.
 * @property {Date} updated_at - Timestamp for when the GST state code was last updated.
 *
 * @details
 * - The schema allows association with specific s but is not required.
 * - The collection name is explicitly set to 'gst_state_codes'.
 */
const gstStateCodeSchema = new mongoose.Schema({
    /* ID, optional. Unique numeric identifier for the tax setting within a . */
    id: {
        type: String,
        required: false,
        unique: true,
        trim: true,
        default: null
    },

    /* Tax, required. Array of tax names or values. */
    code: {
        type: String,
        required: [true, "Tax is required"],
        trim: true,
    },

    /* Handled By, optional. Identifier for the user who handled this tax setting record. */
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
    collection: 'gst_state_codes',  /* 👈 custom collection name */
});



const TaxSettingsModel = mongoose.model<ITaxSettings>('TaxSettings', taxSettingsSchema);
const GstStateCodeModel = mongoose.model('GstStateCode', gstStateCodeSchema);
export { TaxSettingsModel, GstStateCodeModel };
