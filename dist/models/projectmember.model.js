"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const projectSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Types.ObjectId, required: true },
    projectId: { type: mongoose_1.default.Types.ObjectId, required: true }
});
module.exports = mongoose_1.default.model('project member', projectSchema);
