import mongoose from 'mongoose';

// Define the interface for TypeScript
export interface IPurchaseItems extends mongoose.Document {
    invoice_number: string;  // Make sure this is typed as string
    supplier_id: string;
    product_id: string;
    unit: string;
    quantity: number;
    amount_type?: string;
    amount: {
        retail: number;
        wholesale: number;
        purchasesale_price: number;
        mrp: number;
    };
    tax: {
        percentage: number;
        amount: number;
    };
    total_amount: number;
    hsn_sac_code?: string;
    gst_percentage?: number;
    status: number;
    created_at: Date;
    updated_at: Date;
}

const purchaseItemsSchema = new mongoose.Schema({
    invoice_number: {
        type: String,
        required: [true, "Purchase ID is required"],
        trim: true,
    },

    supplier_id: {
        type: String,
        required: [true, "Supplier ID is required"],
        trim: true,
    },
    tax: {
        type: Object,
        required: true
    },

    product_id: {
        type: String,
        required: [true, "Product ID is required"],
        trim: true,
    },

    unit: {
        type: Number,
        required: [true, "Unit is required"],
        trim: true,
    },

    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [0.01, "Quantity must be greater than 0"],
        trim: true,
    },

    amount_type: {
        type: String,
        enum: ['retail', 'wholesale', 'purchasesale', 'mrp'],
        default: 'retail'
    },
    amount: {
        type: Object,
        required: true
    },
    total_amount: {
        type: Number,
        required: [true, "Total amount is required"],
        min: [0, "Total amount cannot be negative"],
        trim: true,
    },
    status: {
        type: Number,
        default: 1,
        enum: [0, 1, 2],
        comment: "0: Deleted, 1: Active, 2: Cancelled"
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
    collection: 'purchase_items'
});

// Compound index for , invoice_number and product_id
purchaseItemsSchema.index({ invoice_number: 1, product_id: 1 }, {
    unique: true
});


export const PurchaseItems = mongoose.model<IPurchaseItems>('PurchaseItems', purchaseItemsSchema);