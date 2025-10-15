import userModel from '../Settings/Users/user.model';
import { ValidationService } from '../../Services/valdiationService';
import { ResponseService } from '../../Services/ResponseService';
import { ErrorService } from '../../Services/ErrorService';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Authentication Controller
 * Handles user login and MPIN verification
 */
export class Authentication {
    /**
     * Login method for user authentication
     * @param req - Request object containing user credentials
     * @param res - Response object to send the result
     */
    public static async login(req: { body: any; }, res: any) {
        try {
            ValidationService.validateRequest(req, res);
            let user = await userModel.findOne({ username: req.body.username });
            if (!user) {
                user = await userModel.findOne({ email: req.body.username });
                if (!user) {
                    user = await userModel.findOne({ mobile_number: req.body.username });
                }
            }

            if (!user) {
                let errors = { username: "Invalid username" };
                ResponseService.jsonResponse(422, errors, res, null, "User not found", false);
                return;
            }

            if (await bcrypt.compare(req.body.password, user.password)) {
                const token = jwt.sign(
                { userId: user.user_id},
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
                );
                const userObj = user.toObject();
                userObj.token = token;
                ResponseService.jsonResponse(200, userObj, res, null, "Login successful", true);
                return;
            } else {
                let errors = { password: "Invalid password" };
                ResponseService.jsonResponse(422, errors, res, null, "Invalid password", false);
                return;
            }

        } catch (error: any) {
            ErrorService.handleError(error, res, req);
            return;
        }
    }

    /**
     * Verify MPIN for user authentication
     * @param req - Request object containing user ID and MPIN
     * @param res - Response object to send the result
     */
    public static async verifyMpin(req: { body: any; }, res: any) {

        ValidationService.validateRequest(req, res);
        let user = await userModel.findOne({ user_id: req.body.user_id, status: 1 });

        if (user?.mpin == req.body.mpin) {
            ResponseService.jsonResponse(200, null, res, null, "MPIN verification successful", true);
            return;
        } else {
            let errors = { mpin: "Invalid MPIN" };
            ResponseService.jsonResponse(422, errors, res, null, "Invalid MPIN", false);
            return;
        }
    }

    public static async logout(req: { body: any; }, res: any) { }

}
