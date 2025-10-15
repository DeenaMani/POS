import mongoose from 'mongoose';

// Define the Purchase type for TypeScript
export interface IPurchasePayments extends mongoose.Document {
    supplier_id: string;
    invoice_number: string;  // Make sure this is typed as string
    payment_method: string;
    payment_amount: number;
    payment_date: Date;
    created_at: Date;
    updated_at: Date;
}

// Import mongoose Double type if available
const { Schema } = mongoose;
const Double = (mongoose as any).Types?.Double || Number;

const purchasePayments = new Schema({
    supplier_id: {
        type: String,
        required: true,
        trim: true,
    },
    invoice_number: {
        type: String,
        required: true,
        trim: true,
    },

    payment_method: {
        type: String,
        required: true
    },
    payment_amount: {
        type: Number,
        required: true
    },
    payment_date: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    }

}, {
    collection: 'purchase_payments',
});

// Compound index for  and invoice_number
purchasePayments.index({ invoice_number: 1 }, {
    unique: true
});



export const PurchasePayments = mongoose.model<IPurchasePayments>('PurchasePayments', purchasePayments);