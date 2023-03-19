"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require('../utils/logger');
const IndexController = require('../controllers/index.controller');
const UserRouter = require('./user.route');
const jwt = require('jsonwebtoken');
function route(app) {
    app.use('/user', UserRouter);
    app.post('/auth/signin', IndexController.signIn);
    app.get('/auth/signin', IndexController.checkSignUp);
    app.post('/auth/signup', IndexController.signUp);
    app.get('/', (req, res) => {
        return res.render('home');
    });
}
module.exports = route;
