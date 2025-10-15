import userModel from "../Modules//Settings/Users/user.model";
import { ResponseService } from "../Services/ResponseService";
const jwt = require('jsonwebtoken');
/**
 * AuthCheck Middleware
 * This middleware checks if the  and user exist and are active.
 * If either is not found, it responds with a 401 Unauthorized status.
 * If both are valid, it calls the next middleware in the stack.
 */
const AuthCheck = async (req: any, res: any, next: any) => {
    try {
        /**
         * Check if user exists and is active.
         * If not, respond with 401 Unauthorized status.
         */
        const user = await userModel.findOne({ user_id: req.headers['user_id'], status: 1 });
        if (!user) {
            ResponseService.jsonResponse(401, null, res, null, "Unauthorized access - User not found");
            return;
        }
        const token = req.headers['access_token']
        if (!token) return res.sendStatus(401); 
        jwt.verify(token, process.env.JWT_SECRET, (err:any, id:any) => {
            if (err)  return res.status(403).json({ message: 'Access denied' });

            const tokenUserId = id.userId;
            const paramUserId = req.headers['user_id'];
            if (tokenUserId.toString() !== paramUserId.toString()) {
                return res.status(403).json({ message: 'Access denied1' });
            }
            next();
        });

    } catch (error) {
        ResponseService.jsonResponse(500, null, res, error, "Internal server error");
    }
};

export default AuthCheck;
