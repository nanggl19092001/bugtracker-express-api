const logger = require('../utils/logger')
const LogMess = require('../utils/logformat')
const accountModel = require('../models/account.model')
const regexEmail = require('../utils/constants')
const bcrypt = require('bcrypt')
const JwtMiddleware = require('../middleware/jwt')

interface IndexControllerInterface {
    signIn(req: any, res: any): Promise<void>
    signUp(req: any, res: any): Promise<void>
    auth(req: any, res: any): Promise<Express.Response>
}

class IndexController implements IndexControllerInterface{
    loginPage(req: any,res: any){
        logger.info(LogMess('GET',req.route.path))
        res.render('login')
    }

    async signIn(req: any, res: any): Promise<void>{

        const email = req.body.email
        const password = req.body.password

        if(!email || !password){
            return res.send(JSON.stringify({status: 500, message: "Missing infomation"}))
        }

        try {
            const result = await accountModel.findOne({email: email})
            if(!result) {
                return res.send(JSON.stringify({status: 404, message: "Invalid account"}))
            }

            const validPassword = await bcrypt.compare(password, result.password)
            if(validPassword){
                const data = {
                    email: result.email,
                    firstname: result.firstname,
                    lastname: result.lastname,
                    id: result._id
                }
                const jwtAccessToken = JwtMiddleware.SignJWT(data)
                return res.send(JSON.stringify({status: 200, message: "Login successfully", access_token: jwtAccessToken}))
            }

            return res.send(JSON.stringify({status: 400, message: "Wrong password"}))

        } catch (error) {
            return res.send(JSON.stringify({status: 500, exception: error}))
        }
    }

    async signUp(req: any, res: any): Promise<void>{
        const email = req.body.email
        const firstname = req.body.firstname
        const lastname = req.body.lastname
        const password = req.body.password

        if(!email || !firstname || !lastname || !password){
            return res.send(JSON.stringify({status: 400, message: "missing infomation"}))
        }
        if(!regexEmail.test(email)){
            return res.send(JSON.stringify({status: 400, message: "invalid email"}))
        }

        try{

            bcrypt.hash(password, 10).then(async (hashed: any) => {

                const result = await accountModel.create({
                    email: email,
                    firstname: firstname,
                    lastname: lastname,
                    password: hashed
                })
                .then(() => {
                    return res.send(JSON.stringify({status: 200, message: "Account create successfully!"}))
                })
                .catch((e: any) => {
                    return res.send(JSON.stringify({status: 500, message: e}))
                })
            })
        }
        catch (e){
            return res.send(JSON.stringify({status: 500, exception: e}))
        }
    }

    async auth(req: any, res: any): Promise<Express.Response>{
        return res
    }
}

module.exports = new IndexController