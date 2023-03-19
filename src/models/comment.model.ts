import mongoose from "mongoose"

//0 - for project
//1 - for ticket

interface Comment {
    sender: mongoose.ObjectId,
    date: Date,
    content: string,
    type: number,
    receiveId: string
}

interface CommentModel extends Comment, mongoose.Document { }

const commentSchema = new mongoose.Schema<CommentModel>({
    sender: mongoose.Types.ObjectId,
    date: {type: Date, default: Date.now},
    content: String,
    type: Number,
    receiveId: String
})

export default mongoose.model<CommentModel>('comment', commentSchema)