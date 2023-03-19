"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const accountSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    firstname: String,
    lastname: String,
    oauth: { type: Boolean, default: false },
    password: { type: String, default: "" }
});
exports.default = mongoose_1.default.model('account', accountSchema);
