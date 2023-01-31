"use strict";
const Express = require('express');
const Router = Express.Router();
const { ValidateJWT } = require('../middleware/jwt');
const UserControllers = require('../controllers/user.controller');
Router.use('/', (req, res, next) => {
    const validateJwtResult = ValidateJWT(req.query.token);
    if (validateJwtResult) {
        console.log(validateJwtResult);
        req.user = validateJwtResult;
        return next();
    }
    else {
        return res.send(JSON.stringify({ status: 400, message: "invalid request, cannot verify user" }));
    }
});
Router.get('/project', UserControllers.getUserProjects);
Router.post('/project', UserControllers.createProject);
module.exports = Router;
