import mongoose from "mongoose";

interface IProductBrand extends mongoose.Document {
    brand_id: number;
    brand_name: string;
    handled_by: string;
    status: number;
    created_at: Date;
    updated_at: Date;
}

/**
 * Represents the schema for a Product Brand in the application.
 *
 * @remarks
 * This schema defines the structure and validation rules for product brand documents
 * stored in the 'product_brands' collection. It includes fields for brand identification,
 * naming, ownership, and status tracking.
 *
 * @property {number} brand_id - Optional. Unique numeric identifier for the brand within a .
 * @property {string} brand_name - Required. Globally unique name for the brand, between 2 and 50 characters.
 * @property {string} handled_by - Optional. Identifier for the user who handled this brand record.
 * @property {number} status - Optional. Brand status, either 0 (inactive) or 1 (active). Default is 1.
 * @property {Date} created_at - Timestamp for when the brand was created. Defaults to current date/time.
 * @property {Date} updated_at - Timestamp for when the brand was last updated. Defaults to current date/time.
 *
 * @details
 * - The schema enforces global uniqueness on brand_name (case-insensitive).
 * - Brands can be associated with specific s but are not required to be.
 * - The collection name is explicitly set to 'product_brands'.
 */
const ProductBrandScheme = new mongoose.Schema({
    /* Brand ID, optional. Unique numeric identifier within a . */
    brand_id: {
        type: Number,
        required: false,
        default: null
    },

    /* Brand name, required. Must be globally unique and between 2-50 characters. */
    brand_name: {
        type: String,
        required: [true, "Brand name is required"],
        trim: true,
        max: [60, "Brand name must be at most 60 characters."],
        min: [3, "Brand name must be at least 3 characters."],
    },

    /* Handled By, optional. Identifier for the user who handled this brand record. */
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
    collection: 'product_brands',  /* 👈 custom collection name */
});


// With a compound index that includes 
ProductBrandScheme.index({ brand_name: 1 }, {
    unique: true,
    collation: { locale: 'en', strength: 2 }
});


/* * Unique index on brand_id and  to ensure no duplicate brands for the same 
 * This index is used to enforce uniqueness of brand_id within the context of a . */
ProductBrandScheme.index({ brand_id: 1 }, { unique: true });


/**
 * Pre-save middleware to update the updated_at timestamp
 */
ProductBrandScheme.pre('save', function (next) {
    if (this.isModified()) {
        this.updated_at = new Date();
    }
    next();
});

const ProductBrandModel = mongoose.model<IProductBrand>('ProductBrand', ProductBrandScheme);
export default ProductBrandModel;