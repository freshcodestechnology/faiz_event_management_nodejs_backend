import mongoose, { Document, Schema } from "mongoose";

// Define TypeScript Interface for Settings
export interface IButton {
    name: string;
    icon: string;
    status: boolean;
}

export interface ISetting extends Document {
    buttons: IButton[];
}

// Define Mongoose Schema
const SettingSchema: Schema = new Schema<ISetting>(
    {
        buttons: [
            {
                name: { type: String, required: true },
                icon: { type: String, required: true },
                status: { type: Boolean, default: true },
            },
        ],
    },
    {
        collection: "settings",
        timestamps: true,
    }
);

// Export the Model
export default mongoose.model<ISetting>("Setting", SettingSchema);
