const { validationResult, body } = require('express-validator');

export class ValidationService {

    public static validateRequest(req: any, res: any): { success: boolean; errors?: Record<string, string> } {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors: Record<string, string> = {};
            for (const error of errors.array()) {
                formattedErrors[error.path] = error.msg;
            }

            return res.status(422).json(
                {
                    success: false,
                    errors: formattedErrors,
                }
            );

        }

        return { success: true };
    }

    public static cleanData(data: any) {
        return Object.fromEntries(
            Object.entries(data).filter(
                ([_, value]) => value !== '' && value !== null && value !== undefined
            )
        );
    }
}
