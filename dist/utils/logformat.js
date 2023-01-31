"use strict";
function LogFormat(method, path) {
    return `${new Date()} ${method} ${path}`;
}
module.exports = LogFormat;
