"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const projectSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    end: { type: Date, required: true },
    deleted: { type: Boolean, default: false },
    creator: { type: mongoose_1.default.Types.ObjectId, required: true }
});
exports.default = mongoose_1.default.model('project', projectSchema);
