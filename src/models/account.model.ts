import mongoose from "mongoose"

interface Account {
    email: String,
    firstname: String,
    lastname: String,
    password: String
}

interface AccountModel extends Account, mongoose.Document { }

const accountSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    firstname: String,
    lastname: String,
    password: {type: String, required: true}
})

module.exports = mongoose.model<AccountModel>('account', accountSchema)