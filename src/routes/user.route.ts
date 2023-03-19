const Express = require('express')
const Router = Express.Router()
const {ValidateJWT} = require('../middleware/jwt')
const UserControllers = require('../controllers/user.controller')

const RP = require('./project.route')
const RT = require('./ticket.route')


Router.use('/', (req: any,res: any,next: any) => {
    const validateJwtResult = ValidateJWT(req.query.token)
    if(validateJwtResult){
        //console.log(validateJwtResult)
        req.user = validateJwtResult
        return next()
    }   
    else{
        return res.send(JSON.stringify({status: 400, message: "invalid request, cannot verify user"}))
    }
})

Router.use('/project',RP)

Router.use('/ticket', RT)

Router.get('/comment', UserControllers.getComment)

Router.get('/search', UserControllers.searchUser)

Router.get('/info', UserControllers.getUserInfo)

module.exports = Router