import mongoose, { Document, Schema } from "mongoose";


/**
 * PrefixSettings model interface
 * - Represents prefix settings for various entities in the system.
 * @interface IPrefixSettings
 * @extends Document
 */
export interface IPrefixSettings extends Document {
    users_prefix: string;
    product_prefix: string;
    invoice_prefix: string;
    estimate_prefix: string;
    sales_prefix: string;
    supplier_prefix: string;
    customer_prefix: string;
}

/**
 * PrefixSettings schema definition
 * - Defines the structure and validation rules for prefix settings.
 * @remarks
 * All prefixes must be uppercase, 3 to 4 characters, unique, and have no defaults.
 */
const prefixSettingsSchema = new Schema<IPrefixSettings>(
    {
        /* Prefix for users, required, 3-4 uppercase letters, unique. */
        users_prefix: {
            type: String,
            required: true,
            minlength: [3, "users_prefix must be at least 3 characters."],
            maxlength: [4, "users_prefix must be at most 4 characters."],
            uppercase: true,
            match: [/^[A-Z]{3,4}$/, "users_prefix must be 3-4 uppercase letters."],
            unique: true,
        },
        /* Prefix for products, required, 3-4 uppercase letters, unique. */
        product_prefix: {
            type: String,
            required: true,
            minlength: [3, "product_prefix must be at least 3 characters."],
            maxlength: [4, "product_prefix must be at most 4 characters."],
            uppercase: true,
            match: [/^[A-Z]{3,4}$/, "product_prefix must be 3-4 uppercase letters."],
            unique: true,
        },
        /* Prefix for invoices, required, 3-4 uppercase letters, unique. */
        invoice_prefix: {
            type: String,
            required: true,
            minlength: [3, "invoice_prefix must be at least 3 characters."],
            maxlength: [4, "invoice_prefix must be at most 4 characters."],
            uppercase: true,
            match: [/^[A-Z]{3,4}$/, "invoice_prefix must be 3-4 uppercase letters."],
            unique: true,
        },
        estimate_prefix: {
            type: String,
            required: true,
            minlength: [3, "estimate_prefix must be at least 3 characters."],
            maxlength: [4, "estimate_prefix must be at most 4 characters."],
            uppercase: true,
            match: [/^[A-Z]{3,4}$/, "estimate_prefix must be 3-4 uppercase letters."],
            unique: true,
        },
        /* Prefix for purchases, required, 3-4 uppercase letters, unique. */
        sales_prefix: {
            type: String,
            required: true,
            minlength: [3, "sales_prefix must be at least 3 characters."],
            maxlength: [4, "sales_prefix must be at most 4 characters."],
            uppercase: true,
            match: [/^[A-Z]{3,4}$/, "sales_prefix must be 3-4 uppercase letters."],
            unique: true,
        },
        /* Prefix for suppliers, required, 3-4 uppercase letters, unique. */
        supplier_prefix: {
            type: String,
            required: true,
            minlength: [3, "supplier_prefix must be at least 3 characters."],
            maxlength: [4, "supplier_prefix must be at most 4 characters."],
            uppercase: true,
            match: [/^[A-Z]{3,4}$/, "supplier_prefix must be 3-4 uppercase letters."],
            unique: true,
        },
        /* Prefix for customers, required, 3-4 uppercase letters, unique. */
        customer_prefix: {
            type: String,
            required: true,
            minlength: [3, "customer_prefix must be at least 3 characters."],
            maxlength: [4, "customer_prefix must be at most 4 characters."],
            uppercase: true,
            match: [/^[A-Z]{3,4}$/, "customer_prefix must be 3-4 uppercase letters."],
            unique: true,
        },
    },
    {
        collection: 'prefix_settings', /* Explicitly set the collection name to 'prefix_settings' */
    }
);

const PrefixSettingsModel = mongoose.model<IPrefixSettings>('PrefixSettings', prefixSettingsSchema);
export default PrefixSettingsModel;
