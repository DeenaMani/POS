import mongoose from "mongoose";
import CustomerModel from "../../Customer/customer.model";

/**
 * Sale model interface
 * - Represents a sale in the system, including details like product sold, quantity, price, and sale date.
 *  * @interface ISale
 * @extends Document
 * Represents a sale in the system.
 * 
 */
interface ISale extends mongoose.Document {
    bill_number: string;
    discount?: {
        percentage: string;
        amount: number;
    };
    total: number;
    tax?: number;
    net_total: number;
    paid: number;
    outstanding: number;
    bill_date: Date;
    remarks?: string;
    customer_id: string;
    created_at: Date;
    updated_at: Date;
}

/**
 * Represents the schema for a Sale in the application.
 *
 * @remarks
 * This schema defines the structure and validation rules for sale documents
 * stored in the 'sales' collection. It includes fields for sale identification,
 * product details, sale date, and status tracking.
 *
 * @property {string}  - References the  to which the sale belongs.
 * @property {string} bill_number - Unique identifier for the sale within a .
 * @property {Array<{ percentage: string; amount: number; }>} discount - List of discounts applied to the sale.
 * @property {number} total - Total sale amount.
 * @property {number} paid - Amount paid by the customer.
 * @property {number} outstanding - Amount still owed by the customer.
 * @property {number} net_total - Total after discounts.
 * @property {Date} bill_date - Date of the sale.
 * @property {string} notes - Additional notes about the sale.
 * @property {string} customer - Customer associated with the sale, referenced by customer_id.
 * @property {Date} created_at - Timestamp for creation.
 * @property {Date} updated_at - Timestamp for last update.
 */
const saleSchema = new mongoose.Schema({
    /* Bill Number, required. Unique identifier for the sale within a . */
    bill_number: {
        type: String,
        required: [true, "Bill Number is required."],
        unique: true,
        trim: true
    },
    discount: {
        type: Object,
        default: {
            percentage: String,
            amount: Number
        },

    },
    total: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    net_total: {
        type: Number,
        default: 0
    },
    paid: {
        type: Number,
        default: 0
    },
    outstanding: {
        type: Number,
        default: 0
    },

    /* Sale date, required. Must be a valid date. */
    bill_date: {
        type: Date,
        required: [true, "Sale date is required."]
    },

    /* Customer name, optional. Name of the customer associated with the sale. */
    customer_id: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: async function (value: string) {
                if (await CustomerModel.findOne({ customer_id: value })) {
                    return true;
                }
                return false;
            },
            message: "Selected Customer ID does not exist in the customers collection."
        }
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
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
    collection: 'sales'
});


/**
 * Pre-save middleware to update the updated_at timestamp
 */
saleSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updated_at = new Date();
    }
    next();
});

interface ISaleItems extends mongoose.Document {
    customer_id?: string;
    bill_number: string;
    product_id: string;
    quantity: number;
    price_type?: string;
    price: {
        retail: number;
        wholesale: number;
        purchasesale_price: number;
        mrp: number;
    };
    tax: {
        percentage: number;
        amount: number;
    };
    total: number;
    created_at: Date;
    updated_at: Date;
}


const SaleItemsSchema = new mongoose.Schema({
    customer_id: {
        type: String,
    },
    bill_number: {
        type: String,
        ref: 'Sales',
        required: true
    },
    product_id: {
        type: String,
        ref: 'Products',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price_type: {
        type: String,
        enum: ['retail', 'wholesale', 'purchasesale', 'mrp'],
        default: 'retail'
    },
    price: {
        type: Object,
        required: true
    },
    tax: {
        type: Object,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    }
},
    {
        collection: 'sales_items'
    }
);

interface ISalePayments extends mongoose.Document {
    bill_number: string;
    payment_method: string;
    payment_methods?: string;
    payment_amount: number;
    payment_date: Date;
    created_at: Date;
    updated_at: Date;
}

const SalesModel = mongoose.model<ISale>('Sales', saleSchema);
const SalesItemsModel = mongoose.model<ISaleItems>('SalesItems', SaleItemsSchema);

export { SalesModel, SalesItemsModel };