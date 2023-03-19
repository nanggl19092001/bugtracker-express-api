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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const fs_2 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const project_model_1 = __importDefault(require("../models/project.model"));
const projectmember_model_1 = __importDefault(require("../models/projectmember.model"));
const account_model_1 = __importDefault(require("../models/account.model"));
const validateCreator_1 = __importDefault(require("../middleware/validateCreator"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const ticket_model_1 = __importDefault(require("../models/ticket.model"));
class UserController {
    //Get projects which user attended
    getUserProjects(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const offset = req.query.offset || 0;
            const limit = req.query.limit || Infinity;
            try {
                const projectCount = yield projectmember_model_1.default.countDocuments({ userId: req.user.id });
                const attendProjects = yield projectmember_model_1.default.find({
                    userId: req.user.id
                }).skip(offset).limit(limit);
                const projects = [];
                for (let attendProject of attendProjects) {
                    projects.push(yield project_model_1.default.findOne({
                        _id: attendProject.projectId,
                    }));
                }
                const data = [];
                for (let i = 0; i < projects.length; i++) {
                    const creator = yield account_model_1.default.findOne({
                        _id: projects[i].creator
                    }, { password: 0 });
                    data.push({ project: projects[i], creator: creator });
                }
                return res.send(JSON.stringify({ status: 200, data: data, count: projectCount }));
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
                const result = yield project_model_1.default.create({
                    name: name,
                    description: description,
                    end: end,
                    creator: creator
                });
                const projectCreatedId = result.id;
                yield projectmember_model_1.default.create({
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
    getProjectMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const project = req.query.id;
            if (!project) {
                return res.status(401).send(JSON.stringify({ status: 401, message: "Project not found" }));
            }
            projectmember_model_1.default.find({
                projectId: project
            }, (err, result) => __awaiter(this, void 0, void 0, function* () {
                if (err)
                    return res.status(500).send(JSON.stringify({ status: 500, message: "Bad query" }));
                let members = [];
                for (const member of result) {
                    let memberInfo = yield account_model_1.default.findOne({ _id: member.userId }, { password: 0 });
                    members.push(memberInfo);
                }
                return res.status(200).send(JSON.stringify({ status: 200, data: members }));
            }));
        });
    }
    addProjectMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMemberId = req.body.user;
            const projectId = req.body.project;
            try {
                const existMember = yield projectmember_model_1.default.find({
                    userId: newMemberId,
                    projectId: projectId
                });
                if (existMember.length > 0) {
                    return res.send(JSON.stringify({ status: 406, message: "Member already added into project" }));
                }
                yield projectmember_model_1.default.create({
                    userId: newMemberId,
                    projectId: projectId
                });
                return res.send(JSON.stringify({ status: 200, message: "Member added" }));
            }
            catch (error) {
                return res.send(JSON.stringify({ status: 500, message: error }));
            }
        });
    }
    searchUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyword = req.query.key;
            if (!keyword) {
                return res.send(JSON.stringify({ status: 400, message: "Missing searching information" }));
            }
            const regexForFindingUser = new RegExp(`${keyword}`, "i");
            account_model_1.default.find({
                $or: [
                    {
                        email: regexForFindingUser
                    },
                    {
                        firstname: regexForFindingUser
                    },
                    {
                        lastname: regexForFindingUser
                    }
                ]
            }, {
                password: 0
            }, (error, result) => __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    return res.send(JSON.stringify({ status: 500, message: error }));
                }
                return res.send(JSON.stringify({ status: 200, data: result }));
            }));
        });
    }
    deleteProjectMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.body.id;
            const project = req.body.project_id;
            if (!user || !project) {
                return res.send(JSON.stringify({ status: 400, message: "Missing information" }));
            }
            try {
                if (!(0, validateCreator_1.default)(req.user.id, project)) {
                    return res.send(JSON.stringify({ status: 401, message: "Only creator can add member to this project" }));
                }
                projectmember_model_1.default.deleteOne({
                    userId: user,
                    projectId: project
                }, (error, result) => {
                    if (error) {
                        return res.send(JSON.stringify({ status: 500, message: error }));
                    }
                    return res.send(JSON.stringify({ status: 200, message: result }));
                });
            }
            catch (e) {
                return res.send(JSON.stringify({ status: 500, message: e }));
            }
        });
    }
    deleteProject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const project = req.body.id;
            if (!project) {
                return res.send(JSON.stringify({ status: 400, message: "Missing information" }));
            }
            try {
                if (!(0, validateCreator_1.default)(req.user.id, project)) {
                    return res.send(JSON.stringify({ status: 401, message: "Only creator can add member to this project" }));
                }
                project_model_1.default.deleteOne({
                    _id: project
                }, (error, result) => {
                    if (error) {
                        return res.send(JSON.stringify({ status: 500, message: error }));
                    }
                    else {
                        projectmember_model_1.default.deleteMany({
                            projectId: project
                        }, (error, result) => {
                            if (error) {
                                return res.send(JSON.stringify({ status: 500, message: error }));
                            }
                            return res.send(JSON.stringify({ status: 200, message: result }));
                        });
                    }
                });
            }
            catch (error) {
                return res.send(JSON.stringify({ status: 500, message: error }));
            }
        });
    }
    alterProject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const project = req.body.projectId;
            const name = req.body.name;
            const description = req.body.description || " ";
            const end = req.body.end;
            if (!project || !end || !name) {
                return res.send(JSON.stringify({ status: 400, message: "Missing important infomation" }));
            }
            let today = new Date();
            let endDate = new Date(end);
            if (today > endDate) {
                return res.send(JSON.stringify({ status: 400, message: "Invalid deadline" }));
            }
            try {
                if (!(0, validateCreator_1.default)(req.user.id, project)) {
                    return res.send(JSON.stringify({ status: 401, message: "Only creator can make change to this project" }));
                }
                project_model_1.default.updateOne({
                    _id: project
                }, {
                    name: name,
                    description: description,
                    end: end
                }, (err, result) => {
                    if (err) {
                        return res.send(JSON.stringify({ status: 500, message: err }));
                    }
                    else {
                        return res.send(JSON.stringify({ status: 200, message: "project updated" }));
                    }
                });
            }
            catch (error) {
                return res.send(JSON.stringify({ status: 500, message: error }));
            }
        });
    }
    createProjectComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const io = req.app.get('socketio');
            const sender = req.user.id;
            const content = req.body.content;
            const type = req.body.type || 0;
            const receiveId = req.body.receiveId;
            if (!sender || !content || !receiveId) {
                return res.send(JSON.stringify({ status: 401, message: "Missing infomation" }));
            }
            try {
                comment_model_1.default.create({
                    sender: sender,
                    content: content,
                    type: type,
                    receiveId: receiveId
                }, (err, result) => {
                    if (err) {
                        return res.send(JSON.stringify({
                            status: 500, message: err
                        }));
                    }
                    io.to(receiveId).emit("message", result);
                    return res.send(JSON.stringify({ status: 200, message: result }));
                });
            }
            catch (error) {
                return res.send(JSON.stringify({
                    status: 500, message: error
                }));
            }
        });
    }
    getTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketId = req.query.id;
            const offset = req.query.offset || 0;
            const limit = req.query.limit || Infinity;
            if (!ticketId) {
                return res.status(401).send(JSON.stringify({ status: 401, message: "Missing ticket id" }));
            }
            ticket_model_1.default.findOne({
                _id: ticketId
            }, (result, error) => {
                if (error)
                    return res.status(500).send(JSON.stringify({ status: 500, message: "Server error" }));
                if (!result)
                    return res.status(404).send(JSON.stringify({ status: 404, message: "Your ticket either deleted or not existed" }));
                return res.status(200).send(JSON.stringify({ status: 200, data: result }));
            });
        });
    }
    getUserTickets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user.id;
            try {
                const countTicket = yield ticket_model_1.default.countDocuments({
                    $or: [
                        { createor: user },
                        { asignee: user }
                    ]
                });
                const tickets = yield ticket_model_1.default.find({
                    $or: [
                        { createor: user },
                        { asignee: user }
                    ]
                });
                return res.status(200).send(JSON.stringify({
                    status: 200, data: tickets, count: countTicket
                }));
            }
            catch (error) {
                return res.status(500).send(JSON.stringify({ status: 500, message: "Bad request" }));
            }
        });
    }
    getProjectTickets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const project = req.query.id;
            try {
                const countTicket = yield ticket_model_1.default.countDocuments({
                    project: project
                });
                const tickets = yield ticket_model_1.default.find({
                    project: project
                });
                return res.status(200).send(JSON.stringify({ status: 200, data: tickets, count: countTicket }));
            }
            catch (error) {
                return res.status(500).send(JSON.stringify({ status: 500, message: error }));
            }
        });
    }
    createTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const creator = req.user.id;
            const project = req.body.project;
            const summary = req.body.summary;
            const description = req.body.description || "";
            const severity = req.body.severity;
            const asignee = req.body.asignee;
            const version = req.body.version;
            const deadline = req.body.deadline || 0;
            if (!summary || !severity || !asignee || !version) {
                return res.status(401).send({ status: 401, message: "Missing required infomation!" });
            }
            // if(asignee == creator){
            //     return res.status(403).send({status: 403, message: "User cannot asign ticket to it "})
            // }
            if (deadline != 0) {
                const UTCDeadline = new Date(deadline);
                const UTCCurrentTime = new Date();
                if (UTCCurrentTime > UTCDeadline) {
                    return res.status(401).send({ status: 401, messate: "Invalid deadline!" });
                }
            }
            try {
                const result = projectmember_model_1.default.findOne({
                    userId: asignee,
                    projectId: project
                });
                if (!result) {
                    return res.status(404).send({ status: 404, message: "User not found in this project" });
                }
                ticket_model_1.default.create({
                    creator: creator,
                    project: project,
                    summary: summary,
                    description: description,
                    severity: severity,
                    asignee: asignee,
                    version: version,
                    deadline: deadline
                }, (err, result) => {
                    if (err)
                        return res.status(500).send({ status: 500, message: "bad query" });
                    return res.status(200).send({ status: 200, message: "ticket created" });
                });
            }
            catch (error) {
                return res.status(500).send({ status: 500, message: "Server error" });
            }
        });
    }
    alterTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user.id;
            const ticketId = req.body.id;
            const summary = req.body.summary;
            const description = req.body.description || "";
            const severity = req.body.severity;
            const version = req.body.version;
            const deadline = req.body.deadline || 0;
            const status = req.body.status;
            try {
                const result = yield ticket_model_1.default.findOne({
                    _id: ticketId
                });
                if (!result) {
                    return res.status(404).send(JSON.stringify({ status: 404, message: "Ticket not found !" }));
                }
                if (result.creator != user) {
                    return res.status(403).send(JSON.stringify({ status: 403, message: "Only ticket creator can modify this ticket !" }));
                }
                ticket_model_1.default.updateOne({
                    _id: ticketId
                }, {
                    summary: summary,
                    description: description,
                    severity: severity,
                    version: version,
                    deadline: deadline,
                    status: status
                }, (error, result) => {
                    if (error)
                        return res.status(500).send(JSON.stringify({ status: 500, message: error }));
                    return res.status(200).send(JSON.stringify({ status: 200, data: result }));
                });
            }
            catch (error) {
                return res.status(500).send(JSON.stringify({ status: 500, message: error }));
            }
        });
    }
    deleteTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketId = req.query.id;
            const user = req.user.id;
            try {
                const ticketCreatorInfo = yield ticket_model_1.default.findOne({ _id: ticketId }, { creator: 1, project: 1 });
                const creator = ticketCreatorInfo.creator;
                const projectCreatorInfo = yield project_model_1.default.findOne({ _id: ticketCreatorInfo.project });
                const projectCreator = projectCreatorInfo.creator;
                if (user != creator && user != projectCreator) {
                    return res.status(403).send(JSON.stringify({ status: 403, message: "Only project creator and ticket creator can delete this ticket" }));
                }
                ticket_model_1.default.deleteOne({ _id: ticketId }, (err, result) => {
                    if (err)
                        return res.status(500).send(JSON.stringify({ status: 500, message: "Server error" }));
                    return res.status(200).send(JSON.stringify({ status: 200, message: "Ticket deleted" }));
                });
            }
            catch (error) {
                return res.status(500).send(JSON.stringify({ status: 500, message: "Server error or ticket not exist" }));
            }
        });
    }
    createTicketComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const io = req.app.get('socketio');
            const sender = req.user.id;
            const content = req.body.content;
            const type = req.body.type || 1;
            const receiveId = req.body.receiveId;
            if (!sender || !content || !receiveId) {
                return res.send(JSON.stringify({ status: 401, message: "Missing infomation" }));
            }
            try {
                comment_model_1.default.create({
                    sender: sender,
                    content: content,
                    type: type,
                    receiveId: receiveId
                }, (err, result) => {
                    if (err) {
                        return res.send(JSON.stringify({
                            status: 500, message: err
                        }));
                    }
                    io.to(receiveId).emit("message", result);
                    return res.send(JSON.stringify({ status: 200, message: result }));
                });
            }
            catch (error) {
                return res.send(JSON.stringify({
                    status: 500, message: error
                }));
            }
        });
    }
    uploadTicketAttachment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!fs_2.default.existsSync(path_1.default.join(__dirname, '../../public/files/' + req.body.id))) {
                    fs_2.default.renameSync(path_1.default.join(__dirname, '../../public/files/temp'), path_1.default.join(__dirname, '../../public/files/' + req.body.id));
                }
                else {
                    fs_2.default.renameSync(req.file.path, path_1.default.join(__dirname, '../../public/files/' + req.body.id + '/' + req.file.originalname));
                    // fs.unlinkSync(req.file.path)
                }
            }
            catch (error) {
                return res.status(500).send({ status: 500, message: "Server upload error, maybe your file name already existed in this ticket" });
            }
            return res.status(200).send({ status: 200, message: "File uploaded successfully" });
        });
    }
    getTicketAttachment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketId = req.query.id;
            try {
                if (!fs_2.default.existsSync(path_1.default.join(__dirname, '../../public/files/' + ticketId)))
                    return res.send(JSON.stringify({ status: 200, filesName: [] }));
                const files = (0, fs_1.readdirSync)(path_1.default.join(__dirname, '../../public/files/' + ticketId));
                return res.status(200).send(JSON.stringify({ status: 200, filesName: files }));
            }
            catch (error) {
                res.status(500).send(JSON.stringify({ status: 500, message: "Server error" }));
            }
        });
    }
    getComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.query.id;
            const offset = req.query.offset || 0;
            const limit = req.query.limit || Infinity;
            try {
                const countComment = yield comment_model_1.default.countDocuments({
                    receiveId: id
                });
                const comments = yield comment_model_1.default.find({
                    receiveId: id
                }).skip(offset).limit(limit);
                if (comments.length == 0)
                    return res.status(200).send(JSON.stringify({ status: 200, message: "id not exist or no comment had been created" }));
                let data = [];
                for (const comment of comments) {
                    let sender = yield account_model_1.default.findOne({ _id: comment.sender }, { password: 0 });
                    data.push({ comment: comment, senderInfo: sender });
                }
                return res.status(200).send(JSON.stringify({ status: 200, data: data, count: countComment }));
            }
            catch (error) {
                return res.status(500).send(JSON.stringify({ status: 500, message: "Server error" }));
            }
        });
    }
    getUserInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUserId = req.query.id;
            account_model_1.default.findOne({
                _id: requestUserId
            }, { password: 0 }, (err, result) => {
                if (err)
                    return res.status(500).send(JSON.stringify({ status: 500, message: "Server error" }));
                if (!result)
                    return res.status(404).send(JSON.stringify({ status: 404, message: "Invalid user" }));
                return res.status(200).send(JSON.stringify({ status: 200, data: result }));
            });
        });
    }
    getNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
module.exports = new UserController;
