import mongoose, { Document, Schema } from "mongoose";

export interface IparticipantUsers extends Document {
    first_name : string;
    last_name : string;
    email: string;    
    designation :string;
    organization : string;
    contact : string;
    country : string;
    state: string;    
    city :string;
    address : string;
}


const participantUsersSchema: Schema = new Schema<IparticipantUsers>(
    {
        first_name : { type: String, required: true },
        last_name : { type: String, required: true },
        email: { type: String, required: true },    
        designation :{ type: String, required: true },
        organization : { type: String, required: true },
        contact : { type: String, required: true },
        country : { type: String, required: true },
        state: { type: String, required: true },    
        city :{ type: String, required: true },
        address : { type: String, required: true },
    },
    {
        collection: "participant_users", 
        timestamps: true,    
    }
);

export default mongoose.model<IparticipantUsers>("participantUsers", participantUsersSchema);