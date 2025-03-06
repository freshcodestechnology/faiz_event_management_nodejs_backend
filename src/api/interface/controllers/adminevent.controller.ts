import { Request, Response } from "express";
import { loggerMsg } from "../../lib/logger";
import { successCreated, successResponse ,ErrorResponse } from "../../helper/apiResponse";
import { storeEvent,updateEvent,getEventTokenDetails ,adminEventList,getEventParticipantUserListModal,getAllEventParticipantUserListModal} from "../../domain/models/event.model";
import {v4 as uuidv4} from "uuid"
import multer from "multer"
import path from "path"
import fs from "fs";
import eventSchema from "../../domain/schema/event.schema";
import reasonSchema from "../../domain/schema/RFV.schema";
import companyActivitySchema from "../../domain/schema/companyActivity.schema";
import Companyactivity from "../../domain/schema/event.schema";
import { cryptoService } from "../../services/cryptoService";
import { env } from "process";

interface FileWithBuffer extends Express.Multer.File {
buffer: Buffer;
}
  
const upload = multer();

const key = env.ENCRYPT_KEY;
const iv = env.DECRYPT_KEY; 

export const getAdminEventDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
    
        const user = await eventSchema.findById(id).select('+event_logo +event_image');
        
        if (!user) {
            return ErrorResponse(res, "User not found");
        }
    
        const baseUrl = env.BASE_URL; 
    
        if (user.event_logo) {
            user.event_logo = baseUrl +'/'+ user.event_logo;
        }
    
        if (user.event_image) {
            user.event_image = baseUrl +'/'+ user.event_image;
        }

        if (user.show_location_image) {
            user.show_location_image = baseUrl +'/'+ user.show_location_image;
        }else{
            user.show_location_image = "";
        }

        if (user.event_sponsor) {
            user.event_sponsor = baseUrl +'/'+ user.event_sponsor;
        }else{
            user.event_sponsor = "";
        }

        const company_visit = await reasonSchema.find({ event_id: id });
        const visitReason = await companyActivitySchema.find({ event_id: id });
    
        return successResponse(res, 'Get Admin Event Details', {
            user,
            company_visit,
            visitReason
        });
        
    } catch (error) {
        return ErrorResponse(res, 'An error occurred during event retrieval.');
    }
};

export const deleteAdminEvent = async (req: Request, res: Response) => {
    try {

        const { events_ids } = req.body; 

        if (!events_ids || !Array.isArray(events_ids) || events_ids.length === 0) {
            return ErrorResponse(res, "No event IDs provided");
        }
        
        const events = await eventSchema.find({ _id: { $in: events_ids } });
        
        if (events.length === 0) {
            return ErrorResponse(res, "No matching events found");
        }
        
        await eventSchema.deleteMany({ _id: { $in: events_ids } });
        await reasonSchema.deleteMany({ event_id: { $in: events_ids } });
        await Companyactivity.deleteMany({ event_id: { $in: events_ids } });
        
        return successResponse(res, "Events and related data deleted successfully", {});
    } catch (error) {
        return ErrorResponse(res,'An error occurred during event retrieval.')
    }
};

export const getAdminEventList = async (req: Request, res: Response) => {

    try {
        const { page = 1, pageSize = 10, searchQuery = "" } = req.query;
        adminEventList(req.user,req.body,
            parseInt(page as string),
            parseInt(pageSize as string),
            searchQuery as string, (error:any, result:any) => {
            if (error) {
                return res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error instanceof Error ? error.message : "An unexpected error occurred."
                });
            }
            return successResponse(res, 'Get Admin Event List', 
                result,
            )
        });
    } catch (error) {
        return  ErrorResponse(res,'An error occurred during user registration.')
    }
      
};

export const getAdminEvents = async (req: Request, res: Response) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send("No files uploaded.");
          }
      
          const files = req.files as FileWithBuffer[];
          
          files.forEach((file) => {
            const field_name = file.fieldname; 
            const fileName = `${Date.now()}-${file.originalname}`; 
            
            const savePath = path.join("uploads", fileName); 
            
            fs.writeFileSync(savePath, file.buffer); 
          
            req.body[field_name] = savePath; 
          });

        const { company_name, event_title, event_slug, reason_for_visiting,event_description,start_date, end_date,google_map_url,address,event_type,company_activity,organizer_name,organizer_email,organizer_phone,sort_des_about_event} = req.body;
        
        storeEvent(req.user,req.body, (error:any, result:any) => {
            if (error) {
                return res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error instanceof Error ? error.message : "An unexpected error occurred."
                });
            }
            return successCreated(res, result)
        });
    } catch (error) {
        return ErrorResponse(res,'An error occurred during event retrieval.')
    }
};

export const storeAdminEvent = async (req: Request, res: Response) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send("No files uploaded.");
        }

        const files = req.files as FileWithBuffer[];

        files.forEach((file) => {
            const field_name = file.fieldname;
            const fileName = `${Date.now()}-${file.originalname}`;

            const savePath = path.join("uploads", fileName);

            fs.writeFileSync(savePath, file.buffer);

            req.body[field_name] = savePath;
        });

        const {
            company_name,
            event_title,
            event_slug,
            reason_for_visiting,
            event_description,
            start_date,
            end_date,
            google_map_url,
            address,
            event_type,
            company_activity,
            organizer_name,
            organizer_email,
            organizer_phone,
            sort_des_about_event,
        } = req.body;

        storeEvent(req.user,req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Get Admin Event List", { result });
        });
    } catch (error) {
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
};

export const updateAdminEvent = async (req: Request, res: Response) => {
    try {
          const files = req.files as FileWithBuffer[];
          
          files.forEach((file) => {
            const field_name = file.fieldname; 
            const fileName = `${Date.now()}-${file.originalname}`; 
            
            const savePath = path.join("uploads", fileName); 
            
            fs.writeFileSync(savePath, file.buffer); 
          
            req.body[field_name] = savePath; 
          });

        const { company_name, event_title, event_slug, reason_for_visiting,event_description,start_date, end_date,google_map_url,address,event_type,company_activity,organizer_name,organizer_email,organizer_phone,sort_des_about_event} = req.body;
        
        updateEvent(req.body, (error:any, result:any) => {
            if (error) {
                return res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error instanceof Error ? error.message : "An unexpected error occurred."
                });
            }
            return successCreated(res, result)
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "An error occurred during user registration.",
        });
    }
};

export const generateUniqueURL = async (req:Request, res:Response) => {
    try{
      
        const token = uuidv4();
        const key = env.ENCRYPT_KEY
        const iv = env.DECRYPT_KEY
        const { slug } = req.params;

        const combinedValue = `${token}:${slug}`;
        
        const encryptedText = cryptoService.encryptCombinedValue(token, slug,key,iv); 

        return res.status(200).json({
            status: "success",
            encryptedText,    
        });
    
        // const redirectUrl = `https://example.com/redirect?token=${encodeURIComponent(encryptedText.encryptedText)}`;
        // return res.redirect(redirectUrl);

    }catch(error){

        return ErrorResponse(res,'An error occurred during event retrieval.')

    }
}

export const getTokeneventDetails = async (req:Request , res:Response) =>{
    try {
        const { token } = req.params;

        if (!token) {
            ErrorResponse(res,'Token is required.')
        }

        getEventTokenDetails(token, (error: any, result: any) => {
            if (error) {
                ErrorResponse(res,'Invalid or expired token.')
            }
            return successResponse(res, 'success', {
                result,
            });

        });

    } catch (error) {
      return  ErrorResponse(res,'An internal server error occurred.')
    }
}

export const getParticipantUserList = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        if (!token) {
            return ErrorResponse(res, 'Token is required.'); 
        }

        getEventParticipantUserListModal(token, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message || 'Invalid or expired token.'); 
            }

            return successResponse(res, 'Success', {
                result,
            });
        });
    } catch (error) {
        return ErrorResponse(res, 'An internal server error occurred.');
    }
};

export const generateRegistrationURL = async (req: Request, res: Response) => {
    try {
        const token = uuidv4();
        const key = env.ENCRYPT_KEY
        const iv = env.DECRYPT_KEY
        const { slug } = req.params;

        const combinedValue = `${token}:${slug}`;
        
        const encryptedText = cryptoService.encryptCombinedValue(token, slug,key,iv);
        
        const redirectUrl = `https://eventservices.in/event/${encodeURIComponent(encryptedText.encryptedText)}`;
        return res.redirect(redirectUrl);
        
    } catch (error) {
        return ErrorResponse(res, 'An internal server error occurred.');
    }
}

export const getAllParticipantUserList = async (req: Request, res: Response) => {
    try {
        const { search = "", page = "1", limit = "10",event_id = "" } = req.query;

        const filters = search.toString();
        const pagination = {
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
        };

        getAllEventParticipantUserListModal(req.user, filters,pagination ,event_id, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message || "Invalid or expired token.");
            }

            return successResponse(res, "Success", result);
        });
    } catch (error) {
        return ErrorResponse(res, "An internal server error occurred.");
    }
};

export const UpdateExtraEventDetails = async (req: Request, res: Response) => {
    try {

    } catch (error) {
        return ErrorResponse(res, 'An internal server error occurred.');
    }
}






