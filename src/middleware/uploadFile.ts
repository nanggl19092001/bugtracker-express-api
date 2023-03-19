const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: function(req: any, file: any, cb: any){
        try {
            if(!fs.existsSync(path.join(__dirname, '../../public/files/temp'))){
                fs.mkdirSync(path.join(__dirname, '../../public/files/temp'))
            }
        } catch (error) {
            cb(error, path.join(__dirname, '../../public/files/temp'))
        }
        
        cb(null, path.join(__dirname, '../../public/files/temp'))
    },
    filename: function(req: any, file: any, cb: any){
        cb(null, file.originalname)
    }
})

const upload = multer({storage: storage})

module.exports = upload