const { body } = require('express-validator');

export class ValidationService {

    /**
     * @returns {Array} Array of validation rules for user login
     * @description This method defines the validation rules for user login.
     */
    public static salesEntryRules() {
        return [
            body('customer_id')
                .notEmpty()
                .withMessage('Customer ID is required'),
            body('products')
                .isArray()
                .withMessage('Products must be an array')
                .notEmpty()
                .withMessage('Products array must not be empty'),
            body('products.*.product_id')
                .notEmpty()
                .withMessage('Product ID is required'),
            body('products.*.quantity')
                .notEmpty()
                .withMessage('Quantity is required')
                .isNumeric()
                .withMessage('Quantity must be a number'),
            body('paid')
                .if(body('paid').exists())
                .notEmpty()
                .withMessage('Paid amount is required')
                .isNumeric()
                .withMessage('Paid amount must be a number'),
            body('payment_method')
                .if(body('paid').exists())
                .notEmpty()
                .withMessage('Payment method is required when paid amount is provided')
                .isIn(['cash', 'credit', 'debit', 'online'])
                .withMessage('Payment method must be one of: cash, credit, debit, online'),
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