import mongoose from "mongoose";
import { getLocationModels } from "../../Location/location.model";

/**
 * BusinessSettings model interface
 * - Represents business settings for a , including business info, contact, and configuration.
 * @interface IBusinessSettings
 * @extends Document
 */
export interface IBusinessSettings extends Document {
    business_type: number | null;
    business_name: string;
    email: string;
    mobile_number: string;
    joined_date: Date;
    country: number;
    country_name: string | null;
    state: number;
    state_name: string | null;
    city: number | '';
    city_name: string | null;
    zip_code: string;
    state_code: string | '';
    address_lane1: string;
    address_lane2?: string;
    currency: string;
    financial_year_from: Date;
    financial_year_to: Date;
    business_logo?: string;
    website?: string;
    profile_percentage?: number;
    status: number;
    created_at: Date;
    updated_at: Date;
}

/**
 * BusinessSettings schema definition
 * - Defines the structure and validation rules for business settings documents.
 */
const businessSettingsSchema = new mongoose.Schema<IBusinessSettings>(
    {
        /**
        * Business type, required.
        * This field stores the type of business (e.g., retail, service, etc.).
        * It must be provided and is represented as a number.
        * @remarks
        * The business_type field is used for categorization and reporting purposes.
        */
        business_type: {
            type: Number,
            required: [true, "Business type is required."],
            default: 1, /* Default to 1 (e.g., Retail) */
        },
        /**
         * Business name, required.
         * This field stores the name of the business and must be provided.
         * It is trimmed to remove any leading or trailing whitespace.
         * @remarks
         * The business_name is used to identify the business in various contexts,
         * such as invoices, reports, and user interfaces.
         */
        business_name: {
            type: String,
            required: [true, "Business name is required."],
            trim: true,
        },
        /**
         * Email address, required.
         * Must be unique and match a valid email format.
         * This field is used for business communications and notifications.
         * @remarks
         * The email field is validated to ensure it follows standard email formatting rules.
         */
        email: {
            type: String,
            required: [true, "Email is required."],
            unique: [true, "Email must be unique."],
            trim: true,
            lowercase: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please enter a valid email address.",
            ],
        },
        /**
         * Mobile number, required.
         * Must be unique and match a specific pattern (digits only).
         * This field is used for contact purposes and must be provided.
         * @remarks
         * The mobile_number field is validated to ensure it contains only digits.
         */
        mobile_number: {
            type: String,
            required: [true, "Mobile number is required."],
            unique: [true, "Mobile number must be unique."],
            trim: true,
            match: [
                /^[0-9]+$/,
                "Mobile number must contain only digits.",
            ],
        },
        /**
         * Date of establishment, required.
         * This field stores the date when the business was established.
         * It must be a valid date and is used for various business calculations.
         * @remarks
         * The joined_date field is essential for determining the age of the business.
         */
        joined_date: {
            type: Date,
            required: [true, "Joined date is required."],
        },
        /**
         * Country, required.
         * This field stores the country where the business is located.
         * It must be provided and is trimmed to remove any leading or trailing whitespace.
         * @remarks
         * The country field is used for localization and compliance purposes.
         */
        country: {
            type: Number,
            required: [true, "Country is required."],
            trim: true,
            validate: {
                validator: async function (value: number) {
                    const { country } = await getLocationModels();
                    return country?.exists({ id: value });
                },
                message: "Country must be a valid country ID.",
            },
        },
        country_name: {
            type: String,
            required: [true, "Country name is required."],
            trim: true,
        },
        /**
         * State, optional.
         * This field stores the state or region where the business is located.
         * It is trimmed to remove any leading or trailing whitespace and defaults to an empty string if not provided.
         * @remarks
         * The state field is used for localization and may be required in some contexts.
         */
        state: {
            type: Number,
            required: [true, "State is required."],
            trim: true,
            validate: {
                validator: async function (value: number) {
                    const { state } = await getLocationModels();
                    return state?.exists({ id: value });
                },
                message: "State must be a valid state ID"
            },
        },
        /**
         * City, required.
         * This field stores the city where the business is located.
         * It must be provided and is trimmed to remove any leading or trailing whitespace.
         * @remarks
         * The city field is used for localization and may be required in some contexts.
         */
        city: {
            type: Number,
            required: [true, "City is required."],
            validate: {
                validator: async function (value: number) {
                    const { city } = await getLocationModels();
                    return city?.exists({ id: value });
                },
                message: "Citye must be a valid state ID"
            },
        },
        /**
         * City name, required.
         * This field stores the name of the city where the business is located.
         * It must be provided and is trimmed to remove any leading or trailing whitespace.
         * @remarks
         * The city_name field is used for localization and may be required in some contexts.
         */
        city_name: {
            type: String,
            required: [true, "City name is required."],
            trim: true,
        },
        /**
         * Zip code, required.
         * This field stores the zip code for the business location.
         * It must be provided and is trimmed to remove any leading or trailing whitespace.
         * @remarks
         * The zip_code field is used for localization and may be required in some contexts.
         */
        zip_code: {
            type: String,
            required: [true, "Zip code is required."],
            trim: true,
        },
        /**
         * Address lane 1, required.
         * This field stores the primary address line for the business location.
         * It must be provided and is trimmed to remove any leading or trailing whitespace.
         * @remarks
         * The address_lane1 field is used for mailing and physical location purposes.
         */
        address_lane1: {
            type: String,
            required: [true, "Address lane 1 is required."],
            trim: true,
        },
        /**
         * Address lane 2, optional.
         * This field stores the secondary address line for the business location.
         * It is trimmed to remove any leading or trailing whitespace and defaults to an empty string if not provided.
         * @remarks
         * The address_lane2 field is used for additional address information, such as suite or apartment numbers.
         */
        address_lane2: {
            type: String,
            required: false,
            trim: true,
            default: '',
        },
        /**
         * State code, optional.
         * This field stores the state code for the business location.
         * It is trimmed to remove any leading or trailing whitespace and defaults to an empty string if not provided.
         * @remarks
         * The state_code field is used for localization and may be required in some contexts.
         */
        state_code: {
            type: String,
            required: false,
            trim: true,
            default: '',
        },
        /**
         * Currency, required.
         * This field stores the currency used by the business.
         * It must be provided and is trimmed to remove any leading or trailing whitespace.
         * @remarks
         * The currency field is used for financial transactions and reporting.
         */
        currency: {
            type: String,
            required: [true, "Currency is required."],
            trim: true,
        },
        /**
         * Financial year start date, required.
         * This field stores the start date of the financial year for the business.
         * It must be a valid date and is used for financial reporting.
         * @remarks
         * The financial_year_from field is essential for determining the financial reporting period.
         */
        financial_year_from: {
            type: Date,
            required: [true, "Financial year from is required."],
        },
        /**
         * Financial year end date, required.
         * This field stores the end date of the financial year for the business.
         * It must be a valid date and is used for financial reporting.
         * @remarks
         * The financial_year_to field is essential for determining the financial reporting period.
         */
        financial_year_to: {
            type: Date,
            required: [true, "Financial year to is required."],
        },
        /**
         * Business logo, optional.
         * This field stores the URL or path to the business logo image.
         * It is trimmed to remove any leading or trailing whitespace and defaults to an empty string if not provided.
         * @remarks
         * The business_logo field is used for branding and may be displayed in various contexts.
         */
        business_logo: {
            type: String,
            required: false,
            trim: true,
            validate: {
                validator: function (value: string) {
                    if (!value) return true;
                    return /\.(jpg|jpeg|png)$/i.test(value);
                },
                message: "Business logo must be a file of type jpg, jpeg, or png.",
            },
        },
        /**
         * Website, optional.
         * This field stores the URL of the business website.
         * It is trimmed to remove any leading or trailing whitespace and defaults to an empty string if not provided.
         * @remarks
         * The website field is used for providing additional information about the business.
         */
        website: {
            type: String,
            required: false,
            trim: true,
            default: '',
        },
        /** 
         * Profile completion percentage, optional.
         * This field stores the percentage of profile completion for the business settings.
         */
        profile_percentage: {
            type: Number,
            required: false,
            default: 0,
        },
        /**
         * Status, optional.
         * This field indicates the status of the business settings.
         * It can be 0 (Archived), 1 (Active), or 2 (Inactive).
         * Defaults to 1 (Active).
         * @remarks
         * The status field is used to manage the visibility and usability of the business settings.
         */
        status: {
            type: Number,
            default: 1,
            enum: [0, 1, 2], // 0: Archived, 1: Active, 2: Inactive
        },
        /**
         * Created at timestamp, optional.
         * This field stores the date and time when the business settings were created.
         * It defaults to the current date and time.
         * @remarks
         * The created_at field is used for auditing and tracking changes to the business settings.
         */
        created_at: {
            type: Date,
            default: Date.now,
        },
        /**
         * Updated at timestamp, optional.
         * This field stores the date and time when the business settings were last updated.
         * It defaults to the current date and time.
         * @remarks
         * The updated_at field is used for auditing and tracking changes to the business settings.
         */
        updated_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: 'business_settings', /* Specify the collection name in MongoDB */
    }
);

const BusinessSettingsModel = mongoose.model<IBusinessSettings>('BusinessSettings', businessSettingsSchema);

export default BusinessSettingsModel;