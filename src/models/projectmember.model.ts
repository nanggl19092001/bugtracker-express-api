import mongoose from "mongoose";

interface ProjectMember {
    userId: mongoose.Types.ObjectId,
    projectId: mongoose.Types.ObjectId
}

interface ProjectMemberModel extends ProjectMember, mongoose.Document {}

const projectSchema = new mongoose.Schema({
    userId: {type: mongoose.Types.ObjectId, required: true},
    projectId: {type: mongoose.Types.ObjectId, required: true}
})

export default mongoose.model<ProjectMemberModel>('project member', projectSchema)
