import mongoose from "mongoose";

interface IProductCategory extends mongoose.Document {
    category_id: number;
    category_name: string;
    handled_by: string;
    status: number;
    created_at: Date;
    updated_at: Date;
}

/**
 * Represents the schema for a Product Category in the application.
 *
 * @remarks
 * This schema defines the structure and validation rules for product category documents
 * stored in the 'product_categories' collection. It includes fields for category identification,
 * naming, ownership, and status tracking.
 *
 * @property {string}  - Optional. References the  to which the category belongs.
 * @property {number} category_id - Optional. Unique numeric identifier for the category within a .
 * @property {string} category_name - Required. Globally unique name for the category, between 2 and 50 characters.
 * @property {string} handled_by - Optional. Identifier for the user who handled this category record.
 * @property {number} status - Optional. Category status, either 0 (inactive) or 1 (active). Default is 1.
 * @property {Date} created_at - Timestamp for when the category was created. Defaults to current date/time.
 * @property {Date} updated_at - Timestamp for when the category was last updated. Defaults to current date/time.
 *
 * @details
 * - The schema enforces global uniqueness on category_name (case-insensitive).
 * - Categories can be associated with specific s but are not required to be.
 * - The collection name is explicitly set to 'product_categories'.
 */
const categorySchema = new mongoose.Schema({
    /* Category ID, optional. Unique numeric identifier within a . */
    category_id: {
        type: Number,
        required: false,
        default: null
    },

    /* Category name, required. Must be globally unique and between 2-50 characters. */
    category_name: {
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        max: [60, "Category name must be at most 60 characters."],
        min: [3, "Category name must be at least 3 characters."],
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
    collection: 'product_categories',  /* 👈 custom collection name */
});


// With a compound index that includes 
categorySchema.index({ category_name: 1 }, {
    unique: true,
    collation: { locale: 'en', strength: 2 }
});

/* * Unique index on category_id and  to ensure no duplicate categories for the same 
 * This index is used to enforce uniqueness of category_id within the context of a . */
categorySchema.index({ category_id: 1 }, { unique: true });


/**
 * Pre-save middleware to update the updated_at timestamp
 */
categorySchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updated_at = new Date();
    }
    next();
});

const ProductCategoryModel = mongoose.model<IProductCategory>('ProductCategory', categorySchema);
export default ProductCategoryModel;