import mongoose from "mongoose";

interface Project {
    name: String,
    description: String,
    end: Date,
    deleted: Boolean,
    creator: mongoose.Types.ObjectId | String
}

interface ProjectModel extends Project, mongoose.Document {}

const projectSchema = new mongoose.Schema<ProjectModel>({
    name: {type: String, required: true, unique: true},
    description: {type: String},
    end: {type: Date, required: true},
    deleted: {type: Boolean, default: false},
    creator: {type: mongoose.Types.ObjectId, required: true}
})

export default mongoose.model<ProjectModel>('project', projectSchema)
