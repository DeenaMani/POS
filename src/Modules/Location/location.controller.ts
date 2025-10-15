import { ErrorService } from "../../Services/ErrorService";
import { ResponseService } from "../../Services/ResponseService";
import { getLocationModels } from "./location.model";

export default class LocationController {
    /**
     * @description This method retrieves all countries from the database.
     */
    public static async getCountries(req: any, res: any) {
        try {
            const { country } = await getLocationModels();
            const searchTerm = req.body?.search || '';
            let query: any = { name: new RegExp(searchTerm, 'i') };
            if (req.body?.id) {
                query.id = req.body.id;
            }
            const getCountries = await country?.find(query);
            ResponseService.jsonResponse(200, getCountries, res, req, "Countries retrieved successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    public static async getStates(req: any, res: any) {
        try {
            const { state } = await getLocationModels();
            let query: any = {
                name: new RegExp(req.body?.search || '', 'i'),
                country_id: req.params.id
            };
            if (req.body?.id) {
                query.id = req.body.id;
            }
            const getStates = await state?.find(query);
            ResponseService.jsonResponse(200, getStates, res, null, "States retrieved successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    public static async getCities(req: any, res: any) {
        try {
            const { city } = await getLocationModels();
            let query: any = {
                name: new RegExp(req.body?.search || '', 'i'),
                state_id: req.params.id
            };
            if (req.body?.id) {
                query.id = req.body.id;
            }
            const getCities = await city?.find(query);
            ResponseService.jsonResponse(200, getCities, res, null, "Cities retrieved successfully");
            return;
        } catch (error) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

}