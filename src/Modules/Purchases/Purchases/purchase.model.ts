import mongoose from 'mongoose';
// Define the Purchase type for TypeScript
export interface IPurchase extends mongoose.Document {
    invoice_number: string;
    supplier_id: string;
    total: number;
    discount?: {
        percentage: string;
        amount: number;
    };
    tax?: number;
    net_amount: number;
    remarks?: string;
    invoice_date: Date;
    paid?: number;
    outstanding?: number;
    payment_status: number;
    status: number;
    handled_by: string;
    created_at: Date;
    updated_at: Date;
}


// Main purchase schema
// Import mongoose Double type if available
const { Schema } = mongoose;
const Double = (mongoose as any).Types?.Double || Number;

const purchaseSchema = new Schema({
    invoice_number: {
        type: String,
        required: true,
        trim: true,
    },

    supplier_id: {
        type: String,
        required: [true, "Supplier ID is required"],
        trim: true,
    },



    total: {
        type: Number,
        required: [true, "Total price is required"],
        min: [0, "Total price cannot be negative"],
        trim: true,
    },

    discount: {
        type: Object,
        default: {
            percentage: String,
            amount: Number
        },

    },
    tax: {
        type: Number,
        default: 0
    },
    net_amount: {
        type: Number,
        required: [true, "Final amount is required"],
        min: [0, "Final amount cannot be negative"],
        trim: true,
    },

    remarks: {
        type: String,
        required: [false, "Remarks is optional"],
        trim: true
    },

    handled_by: {
        type: String,
        required: [true, "User ID of handler is required"],
        trim: true,
    },

    paid: {
        type: Number,
        default: 0,
        min: [0, "Paid amount cannot be negative"],
        trim: true,
    },

    outstanding: {
        type: Number,
        default: 0,
        min: [0, "Balance amount cannot be negative"],
        trim: true,
    },

    invoice_date: {
        type: Date,
        required: [true, "Purchase date is required"],
        default: Date.now,
    },

    payment_status: {
        type: Number,
        default: 0,
        enum: [0, 1],
        comment: "0: Unpaid, 1: Paid"
    },

    status: {
        type: Number,
        default: 1,
        enum: [0, 1, 2],
        comment: "0: Deleted, 1: Active , 2: Inactive"
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
    collection: 'purchases'
});

// Compound index for  and invoice_number
purchaseSchema.index({ invoice_number: 1 }, {
    unique: true
});



export const Purchase = mongoose.model<IPurchase>('Purchase', purchaseSchema);