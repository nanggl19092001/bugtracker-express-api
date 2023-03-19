"use strict";
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            if (!fs.existsSync(path.join(__dirname, '../../public/files/temp'))) {
                fs.mkdirSync(path.join(__dirname, '../../public/files/temp'));
            }
        }
        catch (error) {
            cb(error, path.join(__dirname, '../../public/files/temp'));
        }
        cb(null, path.join(__dirname, '../../public/files/temp'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });
module.exports = upload;
