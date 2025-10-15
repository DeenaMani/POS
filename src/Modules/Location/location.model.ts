import mongoose from 'mongoose';

// Define interfaces for the types
interface ICountry {
    id: number;
    name: string;
    iso3: string;
    iso2: string;
    numeric_code: string;
    phonecode: string;
    capital: string;
    currency: string;
    currency_name: string;
    currency_symbol: string;
    tld: string;
    native: string;
    region: string;
    region_id: number;
    subregion: string;
    subregion_id: number;
    nationality: string;
    timezones: any[];  // You might want to define a more specific type here
    translations: any; // Same as above
    latitude: string;
    longitude: string;
    emoji: string;
}

interface IState {
    id: number;
    name: string;
    country_id: number;
    country_code: string;
    country_name: string;
    state_code: string;
    type: string;
    latitude: string;
    longitude: string;
}

interface ICity {
    id: number;
    name: string;
    state_id: number;
    state_code: string;
    state_name: string;
    country_id: number;
    country_code: string;
    country_name: string;
    latitude: string;
    longitude: string;
    code: string;
}

const CountrySchema = new mongoose.Schema<ICountry>({
    id: Number,
    name: String,
    iso3: String,
    iso2: String,
    numeric_code: String,
    phonecode: String,
    capital: String,
    currency: String,
    currency_name: String,
    currency_symbol: String,
    tld: String,
    native: String,
    region: String,
    region_id: Number,
    subregion: String,
    subregion_id: Number,
    nationality: String,
    timezones: [mongoose.Schema.Types.Mixed],
    translations: mongoose.Schema.Types.Mixed,
    latitude: String,
    longitude: String,
    emoji: String,
});

const StateSchema = new mongoose.Schema<IState>({
    id: Number,
    name: String,
    country_id: Number,
    country_code: String,
    country_name: String,
    state_code: String,
    type: String,
    latitude: String,
    longitude: String,
});

const CitySchema = new mongoose.Schema<ICity>({
    id: Number,
    name: String,
    state_id: Number,
    state_code: String,
    state_name: String,
    country_id: Number,
    country_code: String,
    country_name: String,
    latitude: String,
    longitude: String,
    code: String,
});

let cachedModels: {
    country?: mongoose.Model<ICountry>,
    city?: mongoose.Model<ICity>,
    state?: mongoose.Model<IState>
} = {};

export function getLocationModels() {

    // Return cached models if available
    if (cachedModels.country && cachedModels.city && cachedModels.state) {
        return cachedModels;
    }

    // Create or reuse models from the connection
    cachedModels.country = mongoose.models.Country || mongoose.model<ICountry>('Country', CountrySchema);
    cachedModels.city = mongoose.models.City || mongoose.model<ICity>('City', CitySchema);
    cachedModels.state = mongoose.models.State || mongoose.model<IState>('State', StateSchema);

    return cachedModels;
}
