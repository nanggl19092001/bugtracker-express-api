require('dotenv').config({path: '../../.env'})
const jwt = require('jsonwebtoken')

const secret = process.env.ACCESS_TOKEN_SECRET

function SignJWT(data: any){
    try{
        let jwtSign = jwt.sign(data, secret)
        return jwtSign
    }
    catch(err){
        return err
    }
}

function validateJWT(token: String){
    try {
        let validateResult = jwt.verify(token, secret)
        return validateResult
    } catch (error) {
        return false
    }
}

module.exports = {SignJWT: SignJWT, ValidateJWT: validateJWT}