import mongoose from "mongoose";

interface Ticket {
    creator: String,
    project: String,
    summary: String,
    description: String,
    severity: Number,
    asignee: String,
    status: Number,
    version: String,
    created: Date,
    updated: Date,
    deadline: Date
}

interface TicketModel extends Ticket, mongoose.Document {}

const ticketSchema = new mongoose.Schema<TicketModel>({
    creator: {type: String, required: true},
    project: {type: String, required: true},
    summary: {type: String, required: true},
    description: {type: String, default: ""},
    severity: {type: Number, required: true},
    asignee: {type: String, required: true},
    status: {type: Number, default: 0},
    version: {type: String, default: "0.0"},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now},
    deadline: {type: Date, required: false, default: 0}
})

export default mongoose.model<TicketModel>('ticket', ticketSchema)