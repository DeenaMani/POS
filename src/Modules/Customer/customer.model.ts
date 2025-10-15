import mongoose from "mongoose";
import { getLocationModels } from "../Location/location.model";
import { GstStateCodeModel } from "../TaxSettings/taxSettings.model";

/**
 * customer model interface
 * - Represents a customer in the system, including details like business name, contact person, and address.
 * @interface ICustomer
 * @extends Document
 * Represents a customer in the system.
 */

interface ICustomer extends Document {
    customer_id: string;
    customer_type: number; /* 1 -> B2C, 2 -> B2B */
    business_name?: string;
    customer_name: string;
    mobile_number: number;
    point_card?: string;
    reward_points?: string;
    gst_number?: string;
    gst_state_code?: string;
    country: string | number;
    country_name?: string;
    state: string | number;
    state_name?: string;
    city?: string | number;
    city_name?: string;
    total_amount?: number;
    total_paid?: number;
    total_due?: number;
    pincode?: string;
    address: string;
    notes?: string;
    customer_logo?: string;
    created_at?: Date;
    updated_at?: Date;
}

/**
 * Represents the schema for a customer in the application.
 * @remarks
 * This schema defines the structure and validation rules for customer documents.
 */

const customerSchema = new mongoose.Schema({
    /**
     * Customer ID, required and unique.
     * - Must be a unique identifier for the customer.
     */
    customer_id: {
        type: String,
        required: [false, "customer ID is optional"],
        trim: true,
    },

    /**
     * Sales type, required.
     * - Must be either 1 (B2C) or 2 (B2B).
     */
    customer_type: {
        type: Number,
        required: [true, "Customer type is required"],
        enum: [0, 1],  /* 0 -> B2C, 1 -> B2B */
    },

    /* Business name, required and trimmed. */
    business_name: {
        type: String,
        required: [false, "Business name is optional"],
        trim: true,
        validate: {
            validator: async function (this: any, value: string) {
                if (this.customer_type === 1) {
                    return !!value;
                }
                return true;
            },
            message: "Business name is required for B2B customers."
        },
    },

    /* Customer name, required and trimmed. */
    customer_name: {
        type: String,
        required: true,
        trim: true
    },

    /* Mobile number, required, unique, and validated. */
    mobile_number: {
        type: String,
        required: [true, "Mobile number is required."],
        minlength: [8, "Mobile number must be at least 8 digits."],
        maxlength: [15, "Mobile number must be at most 15 digits."],
        match: [/^\d+$/, "Mobile number must contain only digits."]
    },

    /* Point card, optional and trimmed. */
    point_card: {
        type: String,
        required: false,
        trim: true
    },

    /* Reward points, optional and default to 0. */
    reward_points: {
        type: String,
        required: false,
        default: 0
    },

    /* GST number, optional, unique, and trimmed. */
    gst_number: {
        required: false,
        type: String,
        trim: true,
        min: [15, "GST number must be 15 characters."],
        max: [15, "GST number must be 15 characters."],
        validate: [
            {
                validator: function (this: any, value: string) {
                    /* Required for customer_type 1 (B2B) */
                    if (this.customer_type === 1) {
                        return !!value;
                    }
                    return true;
                },
                message: "GST number is required for B2B customers."
            },
            {
                validator: function (value: string) {
                    if (!value) return true;
                    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value);
                },
                message: "GST number format is invalid."
            }
        ]
    },

    /* GST state code, optional and trimmed. */
    gst_state_code: {
        type: String,
        required: false,
        trim: true,
        validate: [
            {
                validator: function (this: any, value: string) {
                    // Required for customer_type 1 (B2B)
                    if (this.customer_type === 1) {
                        return !!value;
                    }
                    return true;
                },
                message: "GST state code is required for B2B customers."
            },
            {
                validator: async function (this: any, value: string) {
                    let data = await GstStateCodeModel.exists({ id: value })
                    if (this.customer_type === 1 && !data) {
                        return false;
                    }
                    return true;
                },
                message: "GST state code must be valid."
            }
        ]
    },

    /* Country, required and trimmed. */
    country: {
        type: String,
        required: false,
        trim: true,
        validate: {
            validator: async function (value: string) {
                if (!value) return true;
                const { country } = await getLocationModels();
                if (value && country?.findOne({ id: value })) {
                    return true;
                }
                return !!value;
            },
            message: "Invalid country specified."
        }
    },

    /**
     * Country name, optional.
     * - Automatically populated based on the country ID.
     */
    country_name: {
        type: String,
    },

    /* State, required and trimmed. */
    state: {
        type: String,
        required: false,
        trim: true,
        validate: {
            validator: async function (this: any, value: string) {
                if (!value) return true;
                const { state } = await getLocationModels();
                if (this.country && this.state && state?.findOne({ id: value, country_id: this.country })) {
                    return true;
                }
                return !!value;
            },
            message: "Invalid state specified."
        }
    },

    /**
    * State name, optional.
    * - Automatically populated based on the state ID.
    */
    state_name: {
        type: String,
    },

    /* City, optional and trimmed. */
    city: {
        type: String,
        required: false,
        trim: true,
        validate: {
            validator: async function (this: any, value: string) {
                if (!value) return true;
                const { city } = await getLocationModels();
                if (this.state && city?.findOne({ id: value, state_id: this.state })) {
                    return true;
                }
                return !!value;
            },
            message: "Invalid city specified."
        }
    },

    /**
     * City name, optional.
     * - Automatically populated based on the city ID.
     */
    city_name: {
        type: String,
    },

    /* Pincode, optional and must be a number. */
    pincode: {
        type: String,
        required: false,
        trim: true,
        minlength: [5, "Pincode must be at least 5 characters."],
        maxlength: [12, "Pincode must be at most 12 characters."],
        match: [/^\d+$/, "Pincode must contain only digits."]
    },

    /* Address, required and trimmed. */
    address: {
        type: String,
        required: false,
        trim: true
    },

    /* Notes, optional and trimmed. */
    notes: {
        type: String,
        required: false,
        trim: true
    },

    /* Status, optional. Default is 1 (active), can be 0 (deleted) or 2 (inactive). */
    status: {
        type: Number,
        enum: [0, 1, 2],
        trim: true,
        default: 1
    },

    /* customer logo, optional and trimmed. */
    customer_logo: {
        type: String,
        required: false,
        trim: true,
        validate: {
            validator: function (value: string) {
                if (!value) return true;
                return /\.(jpg|jpeg|png)$/i.test(value);
            },
            message: "Customer logo must be a file of type jpg, jpeg, or png.",
        },
    },

    total_amount: {
        type: Number,
        default: 0
    },
    total_paid: {
        type: Number,
        default: 0
    },
    total_due: {
        type: Number,
        default: 0
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
    collection: 'customers'
});

customerSchema.index(
    { customer_id: 1 },
    {
        unique: true,
        partialFilterExpression: {
            $and: [
                { customer_id: { $exists: true } },
                { customer_id: { $type: "string" } },
                { customer_id: { $gt: "" } }
            ]
        }
    }
);

customerSchema.index(
    { mobile_number: 1 },
    {
        unique: true,
        partialFilterExpression: {
            $and: [
                { mobile_number: { $exists: true } },
                { mobile_number: { $type: "string" } },
                { mobile_number: { $gt: "" } }
            ]
        }
    }
);

customerSchema.index(
    { gst_number: 1 },
    {
        unique: true,
        partialFilterExpression: {
            $and: [
                { gst_number: { $exists: true } },
                { gst_number: { $type: "string" } },
                { gst_number: { $gt: "" } }
            ]
        }
    }
);

customerSchema.index(
    { point_card: 1 },
    {
        unique: true,
        partialFilterExpression: {
            $and: [
                { point_card: { $exists: true } },
                { point_card: { $type: "string" } },
                { point_card: { $gt: "" } }
            ]
        }
    }
);

/**
 * Pre-save hook to populate country_name, state_name, and city_name
 * - Automatically fetches and sets the names based on the IDs provided.
 */
customerSchema.pre('save', async function (next) {
    const { city, state, country } = await getLocationModels();
    if (this.city) {
        const cityDoc = await city?.findOne({ id: this.city });
        this.city_name = cityDoc?.name || '';
    }
    if (this.state) {
        const stateDoc = await state?.findOne({ id: this.state });
        this.state_name = stateDoc?.name || '';
    }
    if (this.country) {
        const countryDoc = await country?.findOne({ id: this.country });
        this.country_name = countryDoc?.name || '';
    }
    next();
});

const CustomerModel = mongoose.model<ICustomer>('Customer', customerSchema);

export default CustomerModel;