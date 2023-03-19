"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    sender: mongoose_1.default.Types.ObjectId,
    date: { type: Date, default: Date.now },
    content: String,
    type: Number,
    receiveId: String
});
exports.default = mongoose_1.default.model('comment', commentSchema);
