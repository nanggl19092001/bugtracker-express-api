"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger = require('../utils/logger');
const LogMess = require('../utils/logformat');
const accountModel = require('../models/account.model');
const regexEmail = require('../utils/constants');
const bcrypt = require('bcrypt');
const JwtMiddleware = require('../middleware/jwt');
class IndexController {
    loginPage(req, res) {
        logger.info(LogMess('GET', req.route.path));
        res.render('login');
    }
    signIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = req.body.email;
            const password = req.body.password;
            if (!email || !password) {
                return res.send(JSON.stringify({ status: 500, message: "Missing infomation" }));
            }
            try {
                const result = yield accountModel.findOne({ email: email });
                if (!result) {
                    return res.send(JSON.stringify({ status: 404, message: "Invalid account" }));
                }
                const validPassword = yield bcrypt.compare(password, result.password);
                if (validPassword) {
                    const data = {
                        email: result.email,
                        firstname: result.firstname,
                        lastname: result.lastname,
                        id: result._id
                    };
                    const jwtAccessToken = JwtMiddleware.SignJWT(data);
                    return res.send(JSON.stringify({ status: 200, message: "Login successfully", access_token: jwtAccessToken }));
                }
                return res.send(JSON.stringify({ status: 400, message: "Wrong password" }));
            }
            catch (error) {
                return res.send(JSON.stringify({ status: 500, exception: error }));
            }
        });
    }
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = req.body.email;
            const firstname = req.body.firstname;
            const lastname = req.body.lastname;
            const password = req.body.password;
            if (!email || !firstname || !lastname || !password) {
                return res.send(JSON.stringify({ status: 400, message: "missing infomation" }));
            }
            if (!regexEmail.test(email)) {
                return res.send(JSON.stringify({ status: 400, message: "invalid email" }));
            }
            try {
                bcrypt.hash(password, 10).then((hashed) => __awaiter(this, void 0, void 0, function* () {
                    const result = yield accountModel.create({
                        email: email,
                        firstname: firstname,
                        lastname: lastname,
                        password: hashed
                    })
                        .then(() => {
                        return res.send(JSON.stringify({ status: 200, message: "Account create successfully!" }));
                    })
                        .catch((e) => {
                        return res.send(JSON.stringify({ status: 500, message: e }));
                    });
                }));
            }
            catch (e) {
                return res.send(JSON.stringify({ status: 500, exception: e }));
            }
        });
    }
    auth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return res;
        });
    }
}
module.exports = new IndexController;
