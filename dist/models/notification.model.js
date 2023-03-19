"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    time: { type: Date, default: Date.now },
    type: { type: Number, required: true },
    content: { type: String, required: true },
    receiverId: { type: String, required: true },
    senderId: { type: String, required: true }
});
exports.default = commentSchema;
