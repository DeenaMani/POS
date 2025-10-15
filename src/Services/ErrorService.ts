import { ResponseService } from './ResponseService';

export class ErrorService {

    /**
     * @param error 
     * @param res 
     * @param req 
     * @returns 
     * Handles various types of errors and returns a structured response.
     * It checks the type of error and calls the appropriate handler method.
     */
    public static handleError(error: any, res: any, req: any): any {
        /**
         * Checks the type of error and calls the appropriate handler method.
         * - If the error is a unique validation error (e.g., MongoDB duplicate key error), it calls UniqueValidation.
         * - If the error is a validation error (e.g., Mongoose validation error), it calls ValidationError.
         * - If the error is an instance of Error, it calls InstanceError.
         * - If none of the above, it calls Error.
         */
        if (error.code === 11000) { this.UniqueValidation(error, res, req); return; }
        if (error.name === 'ValidationError') { this.ValidationError(error, res, req); return; }
        if (error instanceof Error) { this.InstanceError(error, res, req); return; } else { this.Error(error, res, req); return; }
    }

    /**
     * @param error 
     * @param res 
     * @param req
     * @returns 
     * Handles unique validation errors, typically from MongoDB.
     * It extracts the field that caused the error and returns a structured response.
     */
    public static UniqueValidation(error: any, res: any, req?: any): any {
        const field = Object.keys(error.keyValue)[0];
        const errors: Record<string, string> = {};
        errors[field] = `${field} already exists`;

        ResponseService.jsonResponse(422, errors, res, req, "Validation error", false);
        return;
    }

    /**
     * @param error 
     * @param res 
     * @param req 
     * @returns 
     * Handles validation errors, typically from Mongoose.
     * It extracts all validation errors and returns a structured response.
     */
    public static ValidationError(error: any, res: any, req: any): any {
        const errors: Record<string, string> = {};
        for (const key in error.errors) {
            errors[key] = error.errors[key].message;
        }
        ResponseService.jsonResponse(422, errors, res, req, "Validation error", false);
        return;
    }

    /**
     * @param error 
     * @param res 
     * @param req 
     * @returns 
     * Handles instance errors, typically from application logic.
     * It returns a structured response with the error message.
     */
    public static InstanceError(error: any, res: any, req: any): any {
        ResponseService.jsonResponse(500, error, res, req, error || "An unexpected error occurred", false);
    }

    /**
     * @param error 
     * @param res 
     * @param req 
     * @returns 
     * Handles generic errors, typically unexpected errors.
     * It returns a structured response with the error message.
     */
    public static Error(error: any, res: any, req: any): any {
        ResponseService.jsonResponse(500, error, res, req, error || "An unexpected error occurred", false);
    }
}
