import { string } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IscannermachineSchema extends Document {
    scanner_name:string;
    scanner_unique_id:string;
    status:string;
    company_id:string;
    expired_date:Date;
}

const scannermachineSchema: Schema = new Schema<IscannermachineSchema>({
    scanner_name:{ type: String, required: true },
    scanner_unique_id:{ type: String, required: true },
    status:{ type: String, required: false,default:"1" },
    company_id:{ type: String, required: false },
    expired_date:{ type: Date, required: false },
},
{
    timestamps: true,
});

export default mongoose.model<IscannermachineSchema>("Scannermachine", scannermachineSchema);
