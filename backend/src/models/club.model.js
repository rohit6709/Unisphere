import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    president: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    vicePresident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    }
}, { timestamps: true });

