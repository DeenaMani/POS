const requestCheck = async (req: any, res: any, next: any) => {
    try {
        const token = process.env.ACCESS_TOKEN;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: "Unauthorized access - Missing or invalid Authorization header" });
        }
        const receivedToken = authHeader.split(' ')[1];

        if (token !== receivedToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access - Invalid token",
                receivedToken
            });
        }

        next();
    } catch (error) {
        console.error("Error in verifyApiRequest middleware:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default requestCheck;
