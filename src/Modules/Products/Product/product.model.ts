import mongoose from "mongoose";
import ProductCategoryModel from "../Category/category.model";
import ProductUnitModel from "../Unit/productunit.model";
import ProductBrandModel from "../Brand/productbrand.model";
import SupplierModel from "../../Supliers/supplier.model";
import { TaxSettingsModel } from "../../TaxSettings/taxSettings.model";

interface IProduct extends mongoose.Document {
    product_id: string;
    product_image: string;
    product_name: string;
    product_code: string;
    unit: number;
    category: number;
    brand: number;
    tax: number;
    hsn_sac_code: string;
    supplier: string;
    price_tax: number;
    mrp: number;
    retailsales_price: number;
    purchasesale_price: number;
    wholesale_price: number;
    opening_stock_qty: number;
    min_stock_qty: number;
    store_location: string;
    handled_by: string;
    status: number;
    availability: number;
    created_at: Date;
    updated_at: Date;
}

/**
 * Represents the schema for a Product in the application.
 *
 * @remarks
 * This schema defines the structure and validation rules for product documents
 * stored in the 'products' collection. It includes fields for product identification,
 * pricing, inventory management, categorization, and tracking.
 *
 * @property {string} product_image - Optional. Path or URL to the product's image. Must be a jpg, jpeg, or png file.
 * @property {string} product_id - Optional. Unique identifier for the product.
 * @property {string} product_code - Required. Unique code for the product.
 * @property {number} unit - Required. Unit of measurement for the product.
 * @property {number} category - Required. Category ID to which the product belongs.
 * @property {number} brand - Optional. Brand ID associated with the product.
 * @property {number} tax - Required. Tax percentage applicable to the product.
 * @property {string} hsn_sac_code - Required. HSN/SAC code for tax classification.
 * @property {string} supplier - Required. Supplier information for the product.
 * @property {number} price_tax - Optional. Tax inclusion type for pricing. Default is 1.
 * @property {number} mrp - Required. Maximum Retail Price of the product.
 * @property {number} retailsales_price - Required. Price for retail sales.
 * @property {number} purchasesale_price - Required. Price at which the product is purchased.
 * @property {number} wholesale_price - Required. Price for wholesale transactions.
 * @property {number} opening_stock_qty - Required. Initial quantity of the product in stock.
 * @property {number} min_stock_qty - Required. Minimum quantity threshold for reordering.
 * @property {string} store_location - Required. Physical location of the product in the store.
 * @property {string} handled_by - Optional. Identifier for the user who handled this product record.
 * @property {number} status - Optional. Product status, either 0 (inactive) or 1 (active). Default is 1.
  * @property {number} availability - Optional. Product availability, either 1 (in stock) or 0 (out of stock). Default is 1.
 * @property {Date} created_at - Timestamp for when the product was created. Defaults to current date/time.
 * @property {Date} updated_at - Timestamp for when the product was last updated. Defaults to current date/time.
 *
 * @details
 * - The schema enforces global uniqueness on product_name and product_code.
 * - Products can be associated with specific s but are not required to be.
 * - The collection name is explicitly set to 'products'.
 */
const productSchema = new mongoose.Schema({
    /* Product image URL or path, optional. Must be a valid jpg, jpeg, or png file. */
    product_image: {
        type: String,
        validate: {
            validator: function (value: string) {
                if (!value) return true;
                return /\.(jpg|jpeg|png)$/i.test(value);
            },
            message: "Product image must be a file of type jpg, jpeg, or png.",
        },
    },

    /* Product ID, optional. Unique identifier for the product. */
    product_id: {
        type: String,
        required: false,
        default: null
    },

    /* Product name, required. Must be unique. */
    product_name: {
        type: String,
        min: [3, "Product name must be at least 3 characters long"],
        max: [100, "Product name must be at most 100 characters long"],
        required: [true, "Product name is required"],
        trim: true
    },

    /* Product code, required. Must be unique. */
    product_code: {
        type: String,
        required: [true, "Product code is required"],
        trim: true
    },

    /* Unit of measurement, required. */
    unit: {
        type: Number,
        required: [true, "Unit is required"],
        validate: {
            validator: async function (value: Number) {
                const unit = await ProductUnitModel.findOne({ unit_id: value, status: 1 });
                return !!unit;
            },
            message: "Unit does not exist in product units collection."
        }
    },

    /* Category ID, optional. */
    category: {
        type: Number,
        required: [false, "Category is optional"],
        validate: {
            validator: async function (value: Number) {
                const category = await ProductCategoryModel.findOne({ category_id: value, status: 1 });
                return !!category;
            },
            message: "Category does not exist in product categories collection."
        },
    },

    /* Brand ID, optional. */
    brand: {
        type: Number,
        required: false,
        validate: {
            validator: async function (value: Number) {
                if (!value) return true;
                const brand = await ProductBrandModel.findOne({ brand_id: value, status: 1 });
                return !!brand;
            },
            message: "Brand does not exist in product brands collection."
        }
    },

    /* Tax percentage, required. */
    tax: {
        type: Number,
        required: [true, "Tax is required"],
        validate: {
            validator: async function (value: Number) {
                if (await TaxSettingsModel.findOne({ tax_id: value, status: 1 })) {
                    return true;
                }
                return false;
            },
            message: "Tax does not exist in tax settings collection."
        }
    },

    /* HSN/SAC code for tax classification, required. */
    hsn_sac_code: {
        type: String,
        min: [4, "HSN/SAC code must be at least 4 characters long"],
        max: [12, "HSN/SAC code must be at most 12 characters long"],
        required: [true, "HSN/SAC code is required"],
        trim: true
    },

    /* Supplier information, required. */
    supplier: {
        type: String,
        required: [false, "Supplier is required"],
        trim: true,
        validate: {
            validator: async function (value: string) {
                if (!value) return false;
                if (value && await SupplierModel.exists({ supplier_id: value })) {
                    return true;
                }
                return false;
            },
            message: "Supplier does not exist in suppliers collection."
        }
    },

    /* Tax inclusion type for pricing, optional. Default is 1. */
    tax_type: {
        type: Number,
        required: [false, "Tax type is optional"],
        default: 1,
        enum: [0, 1],
        comment: "0: Excluding Tax, 1: Including Tax",
    },

    /* Maximum Retail Price, required. */
    mrp: {
        type: Number,
        required: [false, "MRP is required"],
        validate: {
            validator: function (this: any, value: number) {
                if (value < 0) {
                    return [false, "MRP cannot be negative"];
                } else if (value === 0) {
                    return [false, "MRP cannot be zero"];
                } else if (this.retailsales_price && value < this.retailsales_price) {
                    return [false, "MRP cannot be less than retail sales price"];
                } else if (this.purchasesale_price && value < this.purchasesale_price) {
                    return [false, "MRP cannot be less than purchase sale price"];
                } else if (this.wholesale_price && value < this.wholesale_price) {
                    return [false, "MRP cannot be less than wholesale price"];
                }
                return [true];
            }
        }
    },

    /* Retail sales price, required. */
    retailsales_price: {
        type: Number,
        required: [true, "Retail sales price is required"],
        validate: {
            validator: function (this: any, value: number) {
                if (value < 0) {
                    return [false, "Retail sales price cannot be negative"];
                } else if (value === 0) {
                    return [false, "Retail sales price cannot be zero"];
                } else if (this.mrp && value > this.mrp) {
                    return [false, "Retail sales price cannot be greater than MRP"];
                } else if (this.purchasesale_price && value < this.purchasesale_price) {
                    return [false, "Retail sales price cannot be less than purchase sale price"];
                } else if (this.wholesale_price && value < this.wholesale_price) {
                    return [false, "Retail sales price cannot be less than wholesale price"];
                }
                return [true];
            }
        }
    },

    /* Purchase price, required. */
    purchasesale_price: {
        type: Number,
        required: [true, "Purchase sale price is required"],
        validate: {
            validator: function (this: any, value: number) {
                if (value < 0) {
                    return [false, "Purchase sale price cannot be negative"];
                } else if (value === 0) {
                    return [false, "Purchase sale price cannot be zero"];
                } else if (this.mrp && value > this.mrp) {
                    return [false, "Purchase sale price cannot be greater than MRP"];
                } else if (this.retailsales_price && value > this.retailsales_price) {
                    return [false, "Purchase sale price cannot be greater than retail sales price"];
                } else if (this.wholesale_price && value > this.wholesale_price) {
                    return [false, "Purchase sale price cannot be greater than wholesale price"];
                }
                return [true];
            }
        }
    },

    /* Wholesale price, required. */
    wholesale_price: {
        type: Number,
        required: [true, "Wholesale price is required"],
        validate: {
            validator: function (this: any, value: number) {
                if (value < 0) {
                    return [false, "Wholesale price cannot be negative"];
                } else if (value === 0) {
                    return [false, "Wholesale price cannot be zero"];
                } else if (this.mrp && value > this.mrp) {
                    return [false, "Wholesale price cannot be greater than MRP"];
                } else if (this.retailsales_price && value > this.retailsales_price) {
                    return [false, "Wholesale price cannot be greater than retail sales price"];
                } else if (this.purchasesale_price && value < this.purchasesale_price) {
                    return [false, "Wholesale price cannot be less than purchase sale price"];
                }
                return [true];
            }
        }
    },

    /* Initial stock quantity, required. */
    opening_stock_qty: {
        type: Number,
        required: [true, "Opening stock quantity is required"]
    },

    /* Minimum stock threshold, optional. */
    min_stock_qty: {
        type: Number,
        required: [false, "Minimum stock quantity is optional"]
    },

    /* Physical location in store, optional. */
    store_location: {
        type: String,
        required: [false, "Store location is optional"],
        trim: true
    },

    /* Handled By, optional. Identifier for the user who handled this product record. */
    handled_by: {
        type: String,
        required: false,
        trim: true
    },

    /* Status, optional. Default is 1 (active), can be 0 (inactive) or 1 (active). */
    status: {
        type: Number,
        default: 1,
        enum: [0, 1],
        comment: "0: Deleted, 1: Active , 2: Inactive"
    },

    /* Stock status, optional. Default is 1 (active), can be 0 (inactive) or 1 (active). */
    availability: {
        type: Number,
        default: 1,
        enum: [0, 1],
        comment: "1: In Stock, 0: Out of Stock"
    },
    /* Timestamp for creation */
    created_at: {
        type: Date,
    },

    /* Timestamp for last update */
    updated_at: {
        type: Date,
    }
}, {
    collection: 'products'  /* 👈 custom collection name */
});

/**
 * Define indexes for better query performance and enforcing uniqueness
 */
/* Global uniqueness for product name */
productSchema.index(
    { product_name: 1 },
    {
        unique: true,
        collation: { locale: 'en', strength: 2 }
    }
);

/* -scoped uniqueness for product code */
productSchema.index(
    { product_code: 1 },
    {
        unique: true,
        partialFilterExpression: {
            $and: [
                { product_code: { $exists: true } },
                { product_code: { $type: String } },
                { product_code: { $gt: "" } }
            ]
        },
    }
);

/* -scoped uniqueness for product code */
productSchema.index(
    { product_id: 1 },
    {
        unique: true,
        partialFilterExpression: {
            $and: [
                { product_code: { $exists: true } },
                { product_code: { $type: String } },
                { product_code: { $gt: "" } }
            ]
        },
    }
);

/**
 * Pre-save middleware to update the updated_at timestamp
 */
productSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updated_at = new Date();
    }
    next();
});

const ProductModel = mongoose.model<IProduct>('Product', productSchema);
export default ProductModel;