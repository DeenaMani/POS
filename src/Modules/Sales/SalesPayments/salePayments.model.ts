import mongoose from 'mongoose';


interface ISalePayments extends mongoose.Document {
    bill_number: string;
    customer_id?: string;
    payment_method: string;
    payment_methods?: string;
    payment_amount: number;
    payment_date: Date;
    created_at: Date;
    updated_at: Date;
}

const SalesPaymentsSchema = new mongoose.Schema({
    bill_number: {
        type: String,
        ref: 'Sales',
        required: true
    },
    customer_id: {
        type: String,
        ref: 'Customers',
        required: false
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
    collection: 'sales_payments'
});

const SalesPaymentsModel = mongoose.model<ISalePayments>('SalesPayments', SalesPaymentsSchema);

export default SalesPaymentsModel;