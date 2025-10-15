import mongoose from "mongoose";

interface IProductUnit extends mongoose.Document {
    unit_id: number;
    unit_name: string;
    handled_by: string;
    status: number;
    created_at: Date;
    updated_at: Date;
}

/**
 * Represents the schema for a Product Unit in the application.
 *
 * @remarks
 * This schema defines the structure and validation rules for product unit documents
 * stored in the 'product_units' collection. It includes fields for unit identification,
 * naming, ownership, and status tracking.
 *
 * @property {number} unit_id - Optional. Unique numeric identifier for the unit within a .
 * @property {string} unit_name - Required. Globally unique name for the unit, between 2 and 50 characters.
 * @property {string} handled_by - Optional. Identifier for the user who handled this unit record.
 * @property {number} status - Optional. Unit status, either 0 (inactive) or 1 (active). Default is 1.
 * @property {Date} created_at - Timestamp for when the unit was created. Defaults to current date/time.
 * @property {Date} updated_at - Timestamp for when the unit was last updated. Defaults to current date/time.
 *
 * @details
 * - The schema enforces global uniqueness on unit_name (case-insensitive).
 * - Units can be associated with specific s but are not required to be.
 * - The collection name is explicitly set to 'product_units'.
 */
const ProductUnitScheme = new mongoose.Schema({
    /* Unit ID, optional. Unique numeric identifier within a . */
    unit_id: {
        type: Number,
        required: false,
        default: null
    },

    /* Unit name, required. Must be globally unique and between 2-50 characters. */
    unit_name: {
        type: String,
        required: [true, "Unit name is required"],
        trim: true,
        max: [60, "Unit name must be at most 60 characters."],
        min: [3, "Unit name must be at least 3 characters."],
    },

    /* Handled By, optional. Identifier for the user who handled this unit record. */
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
    collection: 'product_units',  /* 👈 custom collection name */
});


// With a compound index that includes 
ProductUnitScheme.index({ unit_name: 1 }, {
    unique: true,
    collation: { locale: 'en', strength: 2 }
});

/* * Unique index on unit_id and  to ensure no duplicate units for the same 
 * This index is used to enforce uniqueness of unit_id within the context of a . */
ProductUnitScheme.index({ unit_id: 1 }, { unique: true });
/**
 * Pre-save middleware to update the updated_at timestamp
 */
ProductUnitScheme.pre('save', function (next) {
    if (this.isModified()) {
        this.updated_at = new Date();
    }
    next();
});

const ProductUnitModel = mongoose.model<IProductUnit>('ProductUnit', ProductUnitScheme);
export default ProductUnitModel;