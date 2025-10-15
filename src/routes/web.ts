import Router from 'express';

const webRoutes = Router();

webRoutes.get('/', (req, res) => {
    res.send("Welcome to the Web App!");
});

export default webRoutes;

