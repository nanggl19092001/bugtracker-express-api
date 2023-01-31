"use strict";
const logger = require('../utils/logger');
function route(app) {
    app.get('/', (req, res) => {
        logger.info(`${new Date()} ${"GET"} ${req.route.path}`);
        return res.render('home');
    });
}
module.exports = route;
