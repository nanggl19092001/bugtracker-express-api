import mongoose from "mongoose";

interface Project {
    name: String,
    description: String,
    end: Date,
    creator: mongoose.Types.ObjectId | String
}

interface ProjectModel extends Project, mongoose.Document {}

const projectSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    description: {type: String},
    end: {type: Date, required: true},
    creator: {type: mongoose.Types.ObjectId, required: true}
})

module.exports = mongoose.model<ProjectModel>('project', projectSchema)
