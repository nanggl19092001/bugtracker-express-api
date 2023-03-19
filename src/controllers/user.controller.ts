import { readdirSync } from "fs"
import { Socket } from "socket.io"
import fs from 'fs'
import path from 'path'

import projectMod from '../models/project.model'
import projectMembersMod from '../models/projectmember.model'
import accountMod from '../models/account.model'
import valCre from '../middleware/validateCreator'
import commentMod from '../models/comment.model'
import ticketMod from '../models/ticket.model'

interface UserControllerInterface {
    getUserProjects(req: any, res: any): Promise<void>
    createProject(req: any, res: any): Promise<void>
    addProjectMember(req: any, res: any): Promise<void>
    searchUser(req: any, res: any): Promise<void>
    deleteProjectMember(req: any, res: any): Promise<void>
    deleteProject(req: any, res: any): Promise<void>
    alterProject(req: any, res: any): Promise<void>
    createProjectComment(req: any, res: any): Promise<void>

    getTicket(req: any, res: any): Promise<void>
    getUserTickets(req: any, res: any): Promise<void>
    getProjectTickets(req: any, res: any): Promise<void>
    createTicket(req: any, res: any): Promise<void>
    alterTicket(req: any, res: any): Promise<void>
    deleteTicket(req: any, res: any): Promise<void>
    uploadTicketAttachment(req: any, res: any): Promise<void>
    createTicketComment(req: any, res: any): Promise<void>

    getNotification(req: any, res: any): Promise<void>;
    getComment(req: any, res: any): Promise<void>
    getUserInfo(req: any, res: any): Promise<void>
}

class UserController implements UserControllerInterface{

    //Get projects which user attended
    async getUserProjects(req: any,res: any){
        const offset = req.query.offset || 0
        const limit = req.query.limit || Infinity

        try {
            const projectCount = await projectMembersMod.countDocuments({userId: req.user.id})
            const attendProjects = await projectMembersMod.find({
                userId: req.user.id
            }).skip(offset).limit(limit)

            const projects = []

            for(let attendProject of attendProjects){
                projects.push(await projectMod.findOne({
                    _id: attendProject.projectId,
                }))
            }

            const data = []

            for(let i = 0; i < projects.length; i++){
                const creator = await accountMod.findOne(
                    {
                        _id: projects[i].creator
                    },{password: 0}
                )
                data.push({project: projects[i], creator: creator})
            }

            return res.send(JSON.stringify({status: 200, data: data, count: projectCount}))
            
        } catch (error) {
            return res.send(JSON.stringify({status: 500, message: error}))
        }
    }

    async createProject(req: any, res: any){
        const name = req.body.name
        const creator = req.user.id
        const end = req.body.deadline
        const description = req.body.description || ""

        if(!name || !end) {
            return res.send(JSON.stringify({status: 400, message: "Missing required infomation"}))
        }

        let today = new Date()
        let endDate = new Date(end)
        if(today > endDate){
            return res.send(JSON.stringify({status: 400, message: "Invalid deadline"}))
        }

        try{
            const result = await projectMod.create({
                name: name,
                description: description,
                end: end,
                creator: creator
            })

            const projectCreatedId = result.id

            await projectMembersMod.create({
                userId: creator,
                projectId: projectCreatedId
            })

            return res.send(JSON.stringify({status: 200, message: "Project created"}))
        }
        catch (e) {
            return res.send(JSON.stringify({status: 500, message: e}))
        }
        
    }

    async getProjectMember(req: any, res: any) {
        const project = req.query.id

        if(!project){
            return res.status(401).send(JSON.stringify({status: 401, message: "Project not found"}))
        }

        projectMembersMod.find({
            projectId: project
        }, async (err: any, result: any) => {
            if(err)
                return res.status(500).send(JSON.stringify({status: 500, message: "Bad query"}))
            
            let members = []
            for(const member of result){
                let memberInfo = await accountMod.findOne({_id: member.userId}, {password: 0})
                members.push(memberInfo)
            }
            
            return res.status(200).send(JSON.stringify({status: 200, data: members}))
        })
    }

    async addProjectMember(req: any, res: any): Promise<void> {
        const newMemberId = req.body.user;
        const projectId = req.body.project;

        try {
            const existMember = await projectMembersMod.find(
                {
                    userId: newMemberId,
                    projectId: projectId
                }
            )

            if(existMember.length > 0){
                return res.send(JSON.stringify({status: 406, message: "Member already added into project"}))
            }

            await projectMembersMod.create({
                userId: newMemberId,
                projectId: projectId
            })

            return res.send(JSON.stringify({status: 200, message: "Member added"}))
        } catch (error) {
            return res.send(JSON.stringify({status: 500, message: error}))
        }
    }

    async searchUser(req: any, res: any): Promise<void> {
        const keyword = req.query.key

        if(!keyword){
            return res.send(JSON.stringify({status: 400, message: "Missing searching information"}))
        }

        const regexForFindingUser = new RegExp(`${keyword}`, "i");
        accountMod.find({
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
        },{
              password: 0  
        }, async (error: any, result: any) => {
            if(error){
                return res.send(JSON.stringify({status: 500, message: error}))
            }

            return res.send(JSON.stringify({status: 200, data: result}))
        })
    }

    async deleteProjectMember(req: any, res: any): Promise<void> {
        const user = req.body.id;
        const project = req.body.project_id
        
        if(!user || !project){
            return res.send(JSON.stringify({status: 400, message: "Missing information"}))
        }
        try{
            if(!valCre(req.user.id, project)){
                return res.send(JSON.stringify({status: 401, message: "Only creator can add member to this project"}))
            }
    
            projectMembersMod.deleteOne({
                userId: user,
                projectId: project
            }, (error: any, result: any) => {
                if(error){
                    return res.send(JSON.stringify({status: 500, message: error}))
                }
    
                return res.send(JSON.stringify({status: 200, message: result}))
            })
        } catch (e) {
            return res.send(JSON.stringify({status: 500, message: e}))
        }
        
    }

    async deleteProject(req: any, res: any): Promise<void> {
        const project = req.body.id

        if(!project) {
            return res.send(JSON.stringify({status: 400, message: "Missing information"}))
        }

        try {
            if(!valCre(req.user.id, project)){
                return res.send(JSON.stringify({status: 401, message: "Only creator can add member to this project"}))
            }

            projectMod.deleteOne({
                _id: project
            }, (error: any, result: any) => {
                if(error){
                    return res.send(JSON.stringify({status: 500, message: error}))
                }
                else{
                    projectMembersMod.deleteMany({
                        projectId: project
                    }, (error: any, result: any) => {
                        if(error){
                            return res.send(JSON.stringify({status: 500, message: error}))
                        }
            
                        return res.send(JSON.stringify({status: 200, message: result}))
                    })
                }
            })
        } catch (error) {
            return res.send(JSON.stringify({status: 500, message: error}))
        }

        
    }

    async alterProject(req: any, res: any): Promise<void> {

        const project: string = req.body.projectId;
        const name: string = req.body.name
        const description: string = req.body.description || " ";
        const end: Date = req.body.end;

        if(!project || !end ||!name){
            return res.send(JSON.stringify({status: 400, message: "Missing important infomation"}))
        }

        let today = new Date()
        let endDate = new Date(end)
        if(today > endDate){
            return res.send(JSON.stringify({status: 400, message: "Invalid deadline"}))
        }

        try {

            if(!valCre(req.user.id, project)){
                return res.send(JSON.stringify({status: 401, message: "Only creator can make change to this project"}))
            }

            projectMod.updateOne(
                {
                    _id: project
                },
                {
                    name: name,
                    description: description,
                    end: end
                },
                (err: any, result: any) => {
                    if(err){
                        return res.send(JSON.stringify({status: 500, message: err}))
                    }
                    else{
                        return res.send(JSON.stringify({status: 200, message: "project updated"}))
                    }
                }
            )

        } catch (error) {
            return res.send(JSON.stringify({status: 500, message: error}))
        }
    }

    async createProjectComment(req: any, res: any): Promise<void> {
        const io: Socket = req.app.get('socketio')
        
        const sender = req.user.id;
        const content = req.body.content;
        const type = req.body.type || 0;
        const receiveId = req.body.receiveId;

        if(!sender || !content || !receiveId){
            return res.send(JSON.stringify({status: 401, message: "Missing infomation"}))
        }

        try {
            commentMod.create({
                sender: sender,
                content: content,
                type: type,
                receiveId: receiveId
            }, (err: any, result: any) => {
                if(err) {
                    return res.send(JSON.stringify({
                        status: 500, message: err
                    }))
                }
                
                io.to(receiveId).emit("message", result)
                return res.send(JSON.stringify({status: 200, message: result}))
            })
        } catch (error) {
            return res.send(JSON.stringify({
                status: 500, message: error
            }))
        }
    }

    async getTicket(req: any, res: any){
        const ticketId = req.query.id;
        const offset = req.query.offset || 0
        const limit = req.query.limit || Infinity

        if(!ticketId){
            return res.status(401).send(JSON.stringify({status: 401, message: "Missing ticket id"}))
        }

        ticketMod.findOne({
            _id: ticketId
        }, (result: any, error: any) => {
            if(error)
                return res.status(500).send(JSON.stringify({status: 500, message: "Server error"}))
            if(!result)
                return res.status(404).send(JSON.stringify({status: 404, message: "Your ticket either deleted or not existed"}))
            return res.status(200).send(JSON.stringify({status: 200, data: result}))
        })
    }

    async getUserTickets(req: any, res: any){
        const user = req.user.id

        try {
            const countTicket = await ticketMod.countDocuments({
                $or: [
                    {createor: user},
                    {asignee: user}
                ]
            })

            const tickets = await ticketMod.find({
                $or: [
                    {createor: user},
                    {asignee: user}
                ]
            })
            return res.status(200).send(JSON.stringify({
                status: 200, data: tickets, count: countTicket
            }))
        } catch (error) {
            return res.status(500).send(JSON.stringify({status: 500, message: "Bad request"}))
        }
    }

    async getProjectTickets(req: any, res: any){
        const project = req.query.id;

        try {
            const countTicket = await ticketMod.countDocuments({
                project: project
            })
            const tickets = await ticketMod.find({
                project: project
            })

            return res.status(200).send(JSON.stringify({status: 200, data: tickets, count: countTicket}))
        } catch (error) {
            return res.status(500).send(JSON.stringify({status: 500, message: error}))
        }
    }

    async createTicket(req: any, res: any){

        const creator = req.user.id;
        
        const project = req.body.project
        const summary = req.body.summary
        const description = req.body.description || ""
        const severity = req.body.severity
        const asignee = req.body.asignee
        const version = req.body.version
        const deadline = req.body.deadline || 0

        if(!summary || !severity || !asignee || !version){
            return res.status(401).send({status: 401, message: "Missing required infomation!"})
        }

        // if(asignee == creator){
        //     return res.status(403).send({status: 403, message: "User cannot asign ticket to it "})
        // }

        if(deadline != 0){
            const UTCDeadline = new Date(deadline)
            const UTCCurrentTime = new Date()
            if(UTCCurrentTime > UTCDeadline){
                return res.status(401).send({status: 401, messate: "Invalid deadline!"})
            }
        }

        try {

            const result = projectMembersMod.findOne({
                userId: asignee,
                projectId: project
            })

            if(!result){
                return res.status(404).send({status: 404, message: "User not found in this project"})
            }

            ticketMod.create({
                creator: creator,
                project: project,
                summary: summary,
                description: description,
                severity: severity,
                asignee: asignee,
                version: version,
                deadline: deadline
            },(err: any, result: any) => {
                if(err) 
                    return res.status(500).send({status: 500, message: "bad query"})
                return res.status(200).send({status: 200, message: "ticket created"})
            })

        } catch (error) {
            return res.status(500).send({status: 500, message: "Server error"})
        }
    }

    async alterTicket(req: any, res: any){
        const user = req.user.id

        const ticketId = req.body.id;

        const summary = req.body.summary
        const description = req.body.description || ""
        const severity = req.body.severity
        const version = req.body.version
        const deadline = req.body.deadline || 0
        const status = req.body.status

        try {
            const result = await ticketMod.findOne({
                _id: ticketId
            })

            if(!result){
                return res.status(404).send(JSON.stringify({status: 404, message: "Ticket not found !"}))
            }

            if(result.creator != user){
                return res.status(403).send(JSON.stringify({status: 403, message: "Only ticket creator can modify this ticket !"}))
            }

            ticketMod.updateOne(
                {
                    _id: ticketId
                },
                {
                    summary: summary,
                    description: description,
                    severity: severity,
                    version: version,
                    deadline: deadline,
                    status: status
                },
                (error: any, result: any) => {
                    if(error)
                        return res.status(500).send(JSON.stringify({status: 500, message: error}))

                    return res.status(200).send(JSON.stringify({status: 200, data: result}))
                }
            )
        } catch (error) {
            return res.status(500).send(JSON.stringify({status: 500, message: error}))
        }
    }

    async deleteTicket(req: any, res: any){
        const ticketId = req.query.id
        const user = req.user.id

        try {
            const ticketCreatorInfo = await ticketMod.findOne({_id: ticketId}, {creator: 1, project: 1})
            const creator = ticketCreatorInfo.creator

            const projectCreatorInfo = await projectMod.findOne({_id: ticketCreatorInfo.project})
            const projectCreator = projectCreatorInfo.creator

            if(user != creator && user != projectCreator){
                return res.status(403).send(JSON.stringify({status: 403, message: "Only project creator and ticket creator can delete this ticket"}))
            }

            ticketMod.deleteOne(
                {_id: ticketId}
            , (err: any, result: any) => {
                if(err)
                    return res.status(500).send(JSON.stringify({status: 500, message: "Server error"}))
                return res.status(200).send(JSON.stringify({status: 200, message: "Ticket deleted"}))
            })
        }
         catch (error) {
            return res.status(500).send(JSON.stringify({status: 500, message: "Server error or ticket not exist"}))
        }
    }


    async createTicketComment(req: any, res: any){
        const io: Socket = req.app.get('socketio')
        
        const sender = req.user.id;
        const content = req.body.content;
        const type = req.body.type || 1;
        const receiveId = req.body.receiveId;

        if(!sender || !content || !receiveId){
            return res.send(JSON.stringify({status: 401, message: "Missing infomation"}))
        }

        try {
            commentMod.create({
                sender: sender,
                content: content,
                type: type,
                receiveId: receiveId
            }, (err: any, result: any) => {
                if(err) {
                    return res.send(JSON.stringify({
                        status: 500, message: err
                    }))
                }
                
                io.to(receiveId).emit("message", result)
                return res.send(JSON.stringify({status: 200, message: result}))
            })
        } catch (error) {
            return res.send(JSON.stringify({
                status: 500, message: error
            }))
        }
    }

    async uploadTicketAttachment(req: any, res: any){
            try {
                if(!fs.existsSync(path.join(__dirname, '../../public/files/' + req.body.id))){
                    fs.renameSync(path.join(__dirname, '../../public/files/temp'), path.join(__dirname, '../../public/files/' + req.body.id))
                }
                else{
                    fs.renameSync(req.file.path, path.join(__dirname, '../../public/files/' + req.body.id + '/' + req.file.originalname))
                    // fs.unlinkSync(req.file.path)
                }
            } catch (error) {
                return res.status(500).send({status: 500, message: "Server upload error, maybe your file name already existed in this ticket"})
            }
            return res.status(200).send({status: 200, message: "File uploaded successfully"})
    }

    async getTicketAttachment(req: any, res: any){
        const ticketId = req.query.id

        try {
            if(!fs.existsSync(path.join(__dirname, '../../public/files/' + ticketId)))
                return res.send(JSON.stringify({status: 200, filesName: []}))
            
            const files = readdirSync(path.join(__dirname, '../../public/files/' + ticketId))

            return res.status(200).send(JSON.stringify({status:200, filesName: files}))
        } catch (error) {
            res.status(500).send(JSON.stringify({status: 500, message: "Server error"}))
        }
    }

    async getComment(req: any, res: any){
        const id = req.query.id;
        const offset = req.query.offset || 0
        const limit = req.query.limit || Infinity

        try {
            const countComment = await commentMod.countDocuments({
                receiveId: id
            })

            const comments = await commentMod.find({
                receiveId: id
            }).skip(offset).limit(limit)

            if(comments.length == 0)
                return res.status(200).send(JSON.stringify({status: 200, message: "id not exist or no comment had been created"}))
            
            let data = []
            for(const comment of comments){
                let sender = await accountMod.findOne({_id: comment.sender}, {password: 0})
                data.push({comment: comment, senderInfo: sender})
            }

            return res.status(200).send(JSON.stringify({status: 200, data: data, count: countComment}))
        } catch (error) {
            return res.status(500).send(JSON.stringify({status: 500, message: "Server error"}))
        }
        
    }

    async getUserInfo(req: any, res: any){
        const requestUserId = req.query.id

        accountMod.findOne({
            _id: requestUserId
        }, {password: 0},(err: any, result: any) => {
            if(err)
                return res.status(500).send(JSON.stringify({status: 500, message: "Server error"}))
            if(!result)
                return res.status(404).send(JSON.stringify({status: 404, message: "Invalid user"}))

            return res.status(200).send(JSON.stringify({status: 200, data: result}))
        })
    }

    async getNotification(req: any, res: any) {
        
    }
}

module.exports = new UserController