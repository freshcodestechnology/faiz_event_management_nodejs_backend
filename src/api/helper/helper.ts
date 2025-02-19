import multer from "multer"
import path from "path"
import fs from "fs"
import { loggerMsg } from "../lib/logger"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "process";
import {RtcTokenBuilder, RtcRole} from "agora-token";
import admin from "../services/firebase";

export const uploadImagesFile = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            
            let folder = "";
            const mimeType = file.mimetype;

            if(mimeType.startsWith('image/')){
                folder = "images"
            }else if(mimeType.startsWith('video/')){
                folder = "videos"
            }else if(mimeType.startsWith('audio/')){
                folder = "audio"
            }else if(mimeType === "application/pdf" || mimeType.startsWith('application/msword') || mimeType.startsWith('application/vnd')){
                folder = "documents";
            }else{
                //@ts-ignore
                return cb(new Error('Unsupported file type'), false)
            }

            const uploadDir = path.resolve(__dirname,'../../assets',folder);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const mimeType = file.mimetype;
            let folder = "";

            // Assign folder based on mime type
            if (mimeType.startsWith('image/')) {
                folder = "images";
            } else if (mimeType.startsWith('video/')) {
                folder = "videos";
            } else if (mimeType.startsWith('audio/')) {
                folder = "audio";
            } else if (mimeType === "application/pdf" || mimeType.startsWith('application/msword') || mimeType.startsWith('application/vnd')) {
                folder = "documents";
            }
            // Modify filename to include the folder name for easy reference
            // const modifiedFileName = `${folder}-${Date.now()}-${file.originalname}`;
            const modifiedFileName = `${folder}-${file.originalname}`;
            cb(null, modifiedFileName);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedImagesExits = ['.png', '.jpg', '.jpeg'];
        const allowedVideosExits = ['.mp4', '.mkv', '.avi'];
        const allowedAudioExits = ['.mp3', '.wav', '.aac'];
        const allowedDocsExits = ['.pdf','.doc', '.docx'];

        const ext = path.extname(file.originalname).toLowerCase();
        if(allowedImagesExits.includes(ext) || allowedVideosExits.includes(ext) || allowedAudioExits.includes(ext) || allowedDocsExits.includes(ext)){
             cb(null, true)
        }else{
            console.log("Unsuported file extension:",ext)
        }
    },
}).array("files")


export const logErrorMessage = (error:any, customMessage:any) => {
    // Log the error details for debugging
    if (error instanceof Error) {
        loggerMsg(`${customMessage}\nError Name${error.name}\nError message: ${error.message}\nStack trace: ${error.stack}`);
    } else {
        loggerMsg(`${customMessage}\nUnexpected error: ${error}`);
    }
}

export const hashdPassword = async (password:string) => {
    return await bcrypt.hash(password, 10)
}

export const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, "supersecretkeys", { expiresIn: "1h" });
};

export const convertToSlug = (text: string): string => {
    return text
        .toLowerCase()                           
        .trim()                                 
        .replace(/\s+/g, '-')                    
        .replace(/[^\w\-]+/g, '')               
        .replace(/\-\-+/g, '-')                
        .replace(/^-+/, '')                     
        .replace(/-+$/, '');                    
};

export const generateAgoraToken = (
    appId: string,
    appCertificate: string,
    channelName: string,
    uid: number,
    expirationTimeInSeconds: number = 3600
): string => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    return RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        RtcRole.PUBLISHER,
        privilegeExpiredTs,
        privilegeExpiredTs
    )
}

