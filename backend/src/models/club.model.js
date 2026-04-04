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
        trim: true,
        default: null
    },
    description: {
        type: String,
        trim: true,
        default: null
    },
    president: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null
    },
    vicePresident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null
    },
    advisors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    }],
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    status: {
        type: String,
        enum: ["pending", "active", "inactive", "rejected"],
        default: "pending"
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        default: null
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        trim: true,
        default: null
    }
}, { timestamps: true });


clubSchema.virtual('memberCount').get(function() {
    return this.members.length;
})

clubSchema.set('toJSON', { virtuals: true });
clubSchema.set('toObject', { virtuals: true });

export const Club = mongoose.model('Club', clubSchema);