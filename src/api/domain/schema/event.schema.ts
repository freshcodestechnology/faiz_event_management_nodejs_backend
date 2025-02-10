import { string } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
    company_id : string;
    company_name: string;
    event_title: string;
    event_slug: string;
    reason_for_visiting: string[]; 
    event_description: string;
    start_date: string[];
    end_date: string[]; 
    google_map_url: string;
    address: string;
    event_type: string;
    company_activity: string[]; 
    event_logo?: string;
    event_image?: string;
    organizer_name: string;
    organizer_email: string;
    organizer_phone: string;
    sort_des_about_event: string;
    createdAt: Date;
    updatedAt: Date;
}

const eventSchema: Schema = new Schema<IEvent>({
    company_id: { type: String, required: false },
    company_name: { type: String, required: true },
    event_title: { type: String, required: true },
    event_slug: { type: String, required: true, unique: true },
    reason_for_visiting: { type: [String], required: true }, 
    event_description: { type: String, required: true },
    start_date : { type: [String], required: true },
    end_date : { type: [String], required: true },
    google_map_url: { type: String, required: true },
    address: { type: String, required: true },
    event_type: { type: String, required: true },
    company_activity: { type: [String], required: true }, 
    event_logo: { type: String },
    event_image: { type: String },
    organizer_name: { type: String, required: true },
    organizer_email: { type: String, required: true },
    organizer_phone: { type: String, required: true },
    sort_des_about_event: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IEvent>("Event", eventSchema);