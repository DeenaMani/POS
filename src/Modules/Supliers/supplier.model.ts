import mongoose from "mongoose";
import { getLocationModels } from "../Location/location.model";
import { GstStateCodeModel } from "../TaxSettings/taxSettings.model";

/**
 * Supplier model interface
 * - Represents a supplier in the system, including details like business name, contact person, and address.
 * @interface ISupplier
 * @extends Document
 * Represents a supplier in the system.
 */
interface ISupplier extends Document {
    supplier_id: string;
    supplier_type: Number;
    business_name: string;
    contact_person: string;
    mobile_number: number;
    gst_number?: string | null;
    gst_state_code?: string | null;
    total_amount?: number;
    total_paid?: number;
    total_due?: number;
    country: string;
    state: string;
    city: string;
    country_name?: string;
    state_name?: string;
    city_name?: string;
    pincode: number | string;
    address: string;
    notes?: string;
    supplier_logo?: string;
    handled_by?: string;
    status?: number;
    created_at?: Date;
    updated_at?: Date;
}

/**
 * Supplier schema definition
 * - Defines the structure and validation rules for supplier documents stored in the 'suppliers' collection.
 */
const supplierSchema = new mongoose.Schema({
    /* Supplier ID, required and unique. */
    supplier_id: {
        type: String,
        required: false,
        trim: true,
        validate: {
            validator: async function (this: any, value: string): Promise<boolean> {
                if (!value) return true;
                const existingSupplier = await SupplierModel.findOne({ supplier_id: value });
                return !existingSupplier;
            }
        },
        message: "Supplier ID must be unique."
    },

    /* Supplier type, required. */
    supplier_type: {
        type: Number,
        enum: [1, 2, 3, 4],
        required: [true, "Supplier type is required"]
    },

    /* Business name, required and trimmed. */
    business_name: {
        type: String,
        required: [true, "Business name is required"],
        trim: true
    },

    /* Contact person, required and trimmed. */
    contact_person: {
        type: String,
        required: [true, "Contact person is required."],
        minlength: [3, "Contact person must be at least 3 characters."],
        maxlength: [60, "Contact person must be at most 60 characters."],
        trim: true
    },

    /* Mobile number, required, unique, and validated. */
    mobile_number: {
        type: String,
        required: [true, "Mobile number is required."],
        minlength: [8, "Mobile number must be at least 8 digits."],
        maxlength: [15, "Mobile number must be at most 15 digits."],
        match: [/^\d+$/, "Mobile number must contain only digits."],
    },


    /* GST number, optional, unique, and trimmed. */
    gst_number: {
        required: [
            function (this: any) {
                return Number(this.supplier_type) !== 4;
            },
            "GST Number is required unless supplier type is 4."
        ],
        type: String,
        trim: true,
        validate: [
            {
                validator: function (value: string) {
                    if (!value) return true;
                    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value);
                },
                message: "GST number format is invalid."
            }
        ]
    },

    /* GST state code, required if supplier_type is not 4, and trimmed. */
    gst_state_code: {
        type: String,
        trim: true,
        required: [
            function (this: any) {
                return Number(this.supplier_type) !== 4 && !this.gst_number && !this.gst_state_code;
            },
            "GST state code is required unless supplier type is 4."
        ],
        validate: [
            {
                validator: async function (this: any, value: string) {
                    console.log(value);
                    if (await GstStateCodeModel?.exists({ id: value })) {
                        return true;
                    }
                    return false;
                },
                message: "Selected GST state code is not valid."
            }
        ]
    },

    /* Country, required and trimmed. */
    country: {
        type: String,
        required: [true, "Country is required."],
        trim: true,
        validate: {
            validator: async function (value: string) {
                const { country } = await getLocationModels();
                if (await country?.exists({ id: value })) {
                    return true;
                }
                return false;
            },
            message: "Selected country is not valid."
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
        required: [true, "State is required."],
        trim: true,
        validate: {
            validator: async function (this: any, value: string) {
                const { state } = await getLocationModels();
                if (await state?.exists({ id: value, country_id: this.country })) {
                    return true;
                }
                return false;
            },
            message: "Selected state is not valid."
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
        required: [true, "City is required."],
        trim: true,
        validate: {
            validator: async function (this: any, value: string) {
                const { city } = await getLocationModels();
                if (await city?.exists({ id: value, state_id: this.state })) {
                    return true;
                }
                return false;
            },
            message: "Selected city is not valid."
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
        required: [true, "Pincode is required."],
        trim: true,
        minlength: [5, "Pincode must be at least 5 characters."],
        maxlength: [12, "Pincode must be at most 12 characters."],
        match: [/^\d+$/, "Pincode must contain only digits."]
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
    /* Address, required and trimmed. */
    address: {
        type: String,
        required: [true, "Address is required."],
        minlength: [5, "Address must be at least 5 characters."],
        maxlength: [200, "Address must be at most 200 characters."],
        trim: true
    },
    /* Notes, optional and trimmed. */
    notes: {
        type: String,
        required: [false, "Notes are optional."],
        maxlength: [500, "Notes must be at most 500 characters."],
        minlength: [5, "Notes must be at least 5 characters."],
        trim: true
    },
    /* Handled by, optional, trimmed. */
    handled_by: {
        type: String,
        required: false,
        trim: true,
    },

    /* Status, optional, default is 1 (active), can be 0 (deleted) or 2 (inactive). */
    status: {
        type: Number,
        enum: [0, 1, 2],
        trim: true,
        default: 1,
    },

    /* Supplier logo, optional, validated for file type. */
    supplier_logo: {
        type: String,
        validate: {
            validator: function (value: string) {
                if (!value) return true;
                return /\.(jpg|jpeg|png)$/i.test(value);
            },
            message: "Supplier logo must be a file of type jpg, jpeg, or png.",
        },
    },

    /* Timestamps for creation and last update. */
    created_at: {
        type: Date,
        default: Date.now
    },

    /* Timestamp for last update, defaults to current date. */
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'suppliers'
});

/**
 * Indexing for supplier schema
 * - Ensures efficient querying and uniqueness for certain fields.
 */
supplierSchema.index(
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

supplierSchema.index(
    { supplier_id: 1 },
    {
        unique: true,
        partialFilterExpression: {
            $and: [
                { supplier_id: { $exists: true } },
                { supplier_id: { $type: "string" } },
                { supplier_id: { $gt: "" } }
            ]
        }
    }
);

supplierSchema.index(
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

/**
 * Pre-save hook to populate country_name, state_name, and city_name
 * - Automatically fetches and sets the names based on the IDs provided.
 */
/* Pre-save hook for 'save' */
supplierSchema.pre('save', async function (next) {
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

/* Pre-hook for 'findOneAndUpdate' */
supplierSchema.pre('findOneAndUpdate', async function (next) {
    const update: any = this.getUpdate();
    const { city, state, country } = await getLocationModels();

    if (update.city) {
        const cityDoc = await city?.findOne({ id: update.city });
        update.city_name = cityDoc?.name || '';
    }
    if (update.state) {
        const stateDoc = await state?.findOne({ id: update.state });
        update.state_name = stateDoc?.name || '';
    }
    if (update.country) {
        const countryDoc = await country?.findOne({ id: update.country });
        update.country_name = countryDoc?.name || '';
    }
    this.setUpdate(update);
    next();
});


/* Pre-save middleware to update the updated_at timestamp */
const SupplierModel = mongoose.model<ISupplier>('Supplier', supplierSchema);
export default SupplierModel;