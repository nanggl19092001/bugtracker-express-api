"use strict";
const winston = require('winston');
const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};
module.exports = winston.createLogger({
    levels: logLevels,
    transports: [
        new winston.transports.File({ filename: 'logs.log' })
    ]
});
