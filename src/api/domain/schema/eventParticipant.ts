import mongoose, { Document, Schema } from "mongoose";

export interface IEventParticipant extends Document {
    participant_user_id : string;
    event_id: string;    
    token :string;
    visit_reason : string;
    referral_source : string;
    company_activity : string;
    qr_image: string;
}

const EventParticipantSchema: Schema = new Schema<IEventParticipant>(
    {
      
        participant_user_id :{ type: String, required: true },
        event_id: { type: String, required: true },    
        token :{ type: String, required: true },
        visit_reason : { type: String, required: true },
        referral_source : { type: String, required: true },
        company_activity : { type: String, required: true },
        qr_image: { type: String, required: false },
    },
    {
        collection: "event_participant", 
        timestamps: true,    
    }
);

export default mongoose.model<IEventParticipant>("EventParticipant", EventParticipantSchema);