import { string } from "joi";
import mongoose, { Document, Schema } from "mongoose";

type ClearedChat = {
    chatId: mongoose.Types.ObjectId; // Reference to the Chat ID
    clearedAt: Date; // Timestamp of when the chat was cleared
};

export interface IUser extends Document {
    name: string; // Full name
    email: string; // Email address
    password: string; //Password
    profilePicture:string//User profile
    role:string//User profile
    status: boolean; // Online status
    createdAt: Date; // Timestamp of account creation
    updatedAt: Date; // Timestamp of last account update
}

// define the user schema
const userSchema:Schema = new Schema<IUser>({
    name: {
        type: String
    },
    email: {
        type: String, unique: true, sparse: true
    },
    password: { type: String },
    profilePicture: { type: String },
    role: { type: String }, 
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model<IUser>("User", userSchema);