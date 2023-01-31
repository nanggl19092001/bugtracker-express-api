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
const projectModel = require('../models/project.model');
const projectMembers = require('../models/projectmember.model');
class UserController {
    getUserProjects(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = req.query.page;
            const limit = req.query.limit;
            try {
                const attendProjects = yield projectMembers.find({
                    userId: req.user.id
                });
                const projects = [];
                for (let attendProject of attendProjects) {
                    projects.push(yield projectModel.findOne({ _id: attendProject.projectId }));
                }
                return res.send(JSON.stringify({ status: 200, data: projects }));
            }
            catch (error) {
                return res.send(JSON.stringify({ status: 500, message: error }));
            }
        });
    }
    createProject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = req.body.name;
            const creator = req.user.id;
            const end = req.body.deadline;
            const description = req.body.description || "";
            if (!name || !end) {
                return res.send(JSON.stringify({ status: 400, message: "Missing required infomation" }));
            }
            let today = new Date();
            let endDate = new Date(end);
            if (today > endDate) {
                return res.send(JSON.stringify({ status: 400, message: "Invalid deadline" }));
            }
            try {
                const result = yield projectModel.create({
                    name: name,
                    description: description,
                    end: end,
                    creator: creator
                });
                const projectCreatedId = result.id;
                yield projectMembers.create({
                    userId: creator,
                    projectId: projectCreatedId
                });
                return res.send(JSON.stringify({ status: 200, message: "Project created" }));
            }
            catch (e) {
                return res.send(JSON.stringify({ status: 500, message: e }));
            }
        });
    }
}
module.exports = new UserController;
