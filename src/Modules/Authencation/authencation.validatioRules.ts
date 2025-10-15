const { body } = require('express-validator');

export class ValidationService {

    /**
     * @returns {Array} Array of validation rules for user login
     * @description This method defines the validation rules for user login.
     */
    public static loginRules() {
        return [
            body('username')
                .notEmpty()
                .withMessage('Username is required'),
            body('password')
                .notEmpty()
                .withMessage('Password is required')
                .isLength({ min: 6, max: 12 })
                .withMessage('Password must be 6-12 characters long'),
        ];
    }

    /**
     * @returns {Array} Array of validation rules for MPIN verification
     * @description This method defines the validation rules for MPIN verification.
     */
    public static verifyMpinRules() {
        return [
            body('user_id')
                .notEmpty()
                .withMessage('User ID is required'),
            body('mpin')
                .notEmpty()
                .withMessage('MPIN is required')
                .isInt({ allow_leading_zeroes: false })
                .withMessage('MPIN must be an integer')
                .isLength({ min: 4, max: 4 })
                .withMessage('MPIN must be 4 digits long'),
        ];
    }
}