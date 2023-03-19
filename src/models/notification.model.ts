import mongoose from 'mongoose'

interface Notification {
    time: Date,
    type: Number,
    content: String,
    receiverId: String,
    senderId: String
}

interface NotificationModel extends Notification, mongoose.Document{}

const commentSchema = new mongoose.Schema<NotificationModel>({
    time: {type: Date, default: Date.now},
    type: {type: Number, required: true},
    content: {type: String, required: true},
    receiverId: {type: String, required: true},
    senderId: {type: String, required: true}
})
export default commentSchema
