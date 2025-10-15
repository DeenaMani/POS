export class ResponseService {

    /**
     * @param error 
     * @param res 
     * @returns 
     * Handles not found errors, typically when a resource is not found.
     * It returns a structured response with the error message.
     */
    public static jsonResponse(code: number, data: any = null, res: any, req?: any, message: string = "Request successful", success: boolean = true): any {
        let errors: any = null;
        if (code < 200 || code >= 300) {
            if (data instanceof Error) {
                errors = { message: data.message, stack: process.env.NODE_ENV === 'development' ? data.stack : undefined };
            } else {
                errors = data;
            }
        }
        return res.status(code).json({ success, message, ...(errors ? { errors } : { data }), request: req ? req.body || '' : null });
    }

}
