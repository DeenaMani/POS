import mongoose, { Document, Schema } from "mongoose";

/**
 * GeneralSettings model interface
 * - Represents general settings for a , including product search, reward points, and sales options.
 * @interface IGeneralSettings
 * @extends Document
 */
export interface IGeneralSettings extends Document {
    product_search: number;         // 0 or 1 (asc or random), default 1
    customer_reward_point: number;
    customer_reward_point_card: number;   // number (default 0)
    negative_quantity: number;      // 0 or 1, default 1
    sales_type: number;             // 0 or 1, default 1 (0: B2C, 1: B2B)
    sales_rate: number;             // 0 or 1 (exclusive/inclusive), default 1
    show_on_mrp: number;            // 0 or 1 (for product on/off), default 1
    expire_date: number;            // 0 or 1 (for product expiration on/off), default 1
    created_at: Date;
    updated_at: Date;
}

/**
 * GeneralSettings schema definition
 * - Defines the structure and validation rules for general settings documents.
 * @remarks
 * This schema includes fields for product search, reward points, sales options, and timestamps.
 */
const generalSettingsSchema = new Schema<IGeneralSettings>(
    {
        /* Product search option, 0 for ascending, 1 for random. Default is 1 (random). */
        product_search: {
            type: Number,
            enum: [0, 1],
            default: 1,
        },
        /* Customer reward points, required field. Default is 0. */
        customer_reward_point: {
            type: Number,
            default: 0,
        },
        /* Customer reward point card, required field. Default is 0. */
        customer_reward_point_card: {
            type: Number,
            enum: [0, 1],
            default: 0,
        },
        /* Negative quantity option, 0 for off, 1 for on. Default is 1 (on). */
        negative_quantity: {
            type: Number,
            enum: [0, 1],
            default: 1,
        },
        /* Sales type, 0 for B2C, 1 for B2B. Default is 1 (B2B). */
        sales_type: {
            type: Number,
            enum: [0, 1],
            default: 1, // 0: B2C, 1: B2B
        },
        /* Sales rate option, 0 for exclusive, 1 for inclusive. Default is 1 (inclusive). */
        sales_rate: {
            type: Number,
            enum: [0, 1],
            default: 1, // 0: Exclusive, 1: Inclusive
        },
        /* Show on MRP option, 0 for off, 1 for on. Default is 1 (on). */
        show_on_mrp: {
            type: Number,
            enum: [0, 1],
            default: 1,
        },
        /* Expire date option, 0 for off, 1 for on. Default is 1 (on). */
        expire_date: {
            type: Number,
            enum: [0, 1],
            default: 1,
        },
        /* Timestamps for creation */
        created_at: {
            type: Date,
            default: Date.now,
        },
        /* Timestamps for last update */
        updated_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: 'general_settings',
    }
);

const GeneralSettingsModel = mongoose.model<IGeneralSettings>('GeneralSettings', generalSettingsSchema);
export default GeneralSettingsModel;