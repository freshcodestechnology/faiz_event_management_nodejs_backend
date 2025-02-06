import { string } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IcompanySchema extends Document {
    company_name:string;
    address:string;
    gst_number:string;
    owner_name:string;
    email_one:string;
    email_two:string;
    subdomain:string;
}

const companySchema: Schema = new Schema<IcompanySchema>({
    company_name:{ type: String, required: true },
    address:{ type: String, required: true },
    gst_number:{ type: String, required: true },
    owner_name:{ type: String, required: true },
    email_one:{ type: String, required: true },
    email_two:{ type: String, required: false },
    subdomain:{ type: String, required: true },
},
{
    timestamps: true,
});

export default mongoose.model<IcompanySchema>("Company", companySchema);
