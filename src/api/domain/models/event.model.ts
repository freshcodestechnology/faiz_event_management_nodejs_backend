import mongoose from "mongoose";
import { convertToSlug } from "../../helper/helper";
import { loggerMsg } from "../../lib/logger";
import eventSchema from "../schema/event.schema";
import reasonSchema from "../schema/RFV.schema";
import companyActivitySchema from "../schema/companyActivity.schema";
import EventParticipantSchema from "../schema/eventParticipant";
import ParticipantSchema from "../schema/participantUsers.schema";
import { userSocketMap } from "../../socket/initDemoSocketHandlers";
import { getIo } from "../../../infrastructure/webserver/express/v1";
import { env } from "../../../infrastructure/env";
import bcrypt from "bcrypt";
import multer from "multer"
import jwt from "jsonwebtoken";
import path from "path"
import QRCode from "qrcode";
import { cryptoService } from "../../services/cryptoService";

interface eventData{
    company_name: string;
    event_title: string;
    event_slug: string;
    event_description: string;
    start_date: string[];
    end_date: string[];
    google_map_url: string;
    address:string,
    event_type:string,
    event_logo:string,
    event_image:string,
    organizer_name:string,
    organizer_email:string,
    organizer_phone:string,
    sort_des_about_event:string,
    reason_for_visiting:string[],
    company_activity:string[],
    event_id?: any,
    show_location_image?:string,
    getting_show_location?:string,
    company_id?:string,
}

interface eventVisitReason{
    event_id : any;
    reason : string[];
}

interface companyActivity{
    event_id : any;
    reason : string[];
}

interface loginUserData{
    user_id:string;
    company_id:string;
}

export const storeEvent = async (loginUserData:loginUserData,eventData: eventData, callback: (error: any, result: any) => void) => {
    try {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './uploads');
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + path.extname(file.originalname));
            },
        });
        console.log(loginUserData.company_id);
        const newEvent = new eventSchema({
            company_id:loginUserData.company_id,
            company_name: eventData.company_name,
            event_title: eventData.event_title,
            event_slug: convertToSlug(eventData.event_slug),
            event_description: eventData.event_description,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            google_map_url: eventData.google_map_url,
            address: eventData.address,
            event_type: eventData.event_type,
            event_logo: eventData.event_logo,
            event_image: eventData.event_image,
            show_location_image: eventData.show_location_image,
            getting_show_location: eventData.getting_show_location,
            organizer_name: eventData.organizer_name,
            organizer_email: eventData.organizer_email,
            organizer_phone: eventData.organizer_phone,
            sort_des_about_event: eventData.sort_des_about_event,
        });

        const savedEvent = await newEvent.save();
        console.log(newEvent);
        const eventId = savedEvent._id;

        const [visitReasonResult, companyActivityResult] = await Promise.all([
            new Promise((resolve, reject) => {
                storeEventVisitReason({ event_id: eventId, reason: eventData.reason_for_visiting }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                storeCompanyActivity({ event_id: eventId, reason: eventData.company_activity }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
            }),
        ]);

        return callback(null, { eventId, visitReasonResult, companyActivityResult });
    } catch (error) {
        return callback(error, null); 
    }
};

export const updateEvent = async (eventData: eventData, callback: (error: any, result: any) => void) => {
    try {
        const eventId = eventData.event_id; 
        const existingEventWithSlug = await eventSchema.findOne({
            event_slug: convertToSlug(eventData.event_slug),
            _id: { $ne: eventId }, 
        });
        
        if (existingEventWithSlug) {
            return callback(new Error("The event_slug is already in use by another event."), null);
        }
        
        const updatedEvent = await eventSchema.findByIdAndUpdate(
            eventId,
            {
                company_name: eventData.company_name,
                event_title: eventData.event_title,
                event_slug: convertToSlug(eventData.event_slug),
                event_description: eventData.event_description,
                start_date: eventData.start_date,
                end_date: eventData.end_date,
                google_map_url: eventData.google_map_url,
                address: eventData.address,
                event_type: eventData.event_type,
                event_logo: eventData.event_logo,
                event_image: eventData.event_image,
                show_location_image: eventData.show_location_image,
                organizer_name: eventData.organizer_name,
                organizer_email: eventData.organizer_email,
                organizer_phone: eventData.organizer_phone,
                getting_show_location: eventData.getting_show_location,
                sort_des_about_event: eventData.sort_des_about_event,
            },
            { new: true } 
        );

        if (!updatedEvent) {
            return callback(new Error("Event not found or update failed."), null);
        }
        const reasonDeleteResult = await reasonSchema.deleteMany({ event_id: eventId });
        const companyActivityDeleteResult = await companyActivitySchema.deleteMany({ event_id: eventId });

        const [visitReasonResult, companyActivityResult] = await Promise.all([
            new Promise((resolve, reject) => {
                storeEventVisitReason({ event_id: eventId, reason: eventData.reason_for_visiting }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                storeCompanyActivity({ event_id: eventId, reason: eventData.company_activity }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
            }),
        ]);

        return callback(null, {
            updatedEvent,
            visitReasonResult,
            companyActivityResult,
        });
    } catch (error) {
        return callback(error, null);
    }
};

export const storeEventVisitReason = async (
    eventVisitReason: eventVisitReason,
    callback: (error: any, result: any) => void
) => {
    try {
        const savedReasons = [];
        for (const visitReason of eventVisitReason.reason) {
            const newReason = new reasonSchema({
                event_id: eventVisitReason.event_id,
                reason: visitReason, 
            });

            const savedReason = await newReason.save();
            savedReasons.push(savedReason);
        }

        return callback(null, savedReasons);
    } catch (error) {
        return callback(error, null);
    }
};

export const storeCompanyActivity = async (
    companyActivity: companyActivity,
    callback: (error: any, result: any) => void
) => {
    try {
       
        const savedReasons = [];
        for (const activityReason of companyActivity.reason) {
            const newReason = new companyActivitySchema({
                event_id: companyActivity.event_id,
                company_activity: activityReason, 
            });

            const savedReason = await newReason.save();
            savedReasons.push(savedReason);
        }

        return callback(null, savedReasons);
    } catch (error) {
        return callback(error, null);
    }
};

export const adminEventList = async (loginUserData:loginUserData,userData: eventData, page: number, pageSize: number, searchQuery: string, callback: (error: any, result: any) => void) => {
    try {
        console.log(loginUserData.company_id);
        const currentPage = page || 1;
        const size = pageSize || 10;

        const skip = (currentPage - 1) * size;

        const searchFilter = searchQuery
            ? {
                  $or: [
                      { company_name: { $regex: searchQuery, $options: 'i' } }, 
                      { event_title: { $regex: searchQuery, $options: 'i' } }, 
                      { event_slug: { $regex: searchQuery, $options: 'i' } }, 
                      { address: { $regex: searchQuery, $options: 'i' } }, 
                    ],
                    company_id: loginUserData.company_id
                }
              : { company_id: loginUserData.company_id };

        const events = await eventSchema.find(searchFilter).skip(skip).limit(size);
        
        const eventswithimage = events.map(event => {
            return {
                ...event.toObject(), 
                event_logo: `${env.BASE_URL}/${event.event_logo}`,
                event_image: `${env.BASE_URL}/${event.event_image}`,
                show_location_image : `${env.BASE_URL}/${event.show_location_image}`,
            };
        });
        const totalUsers = await eventSchema.countDocuments(searchFilter); 
        const result = {
            currentPage: currentPage,
            totalPages: Math.ceil(totalUsers / size),
            totalUsers: totalUsers,
            event: eventswithimage,
        };

        return callback(null, result);
    } catch (error) {
        return callback(error, null);
    }
}

export const getEventTokenDetails = async(encode_string: string, callback: (error: any, result: any) => void) => {

    try {
        const baseUrl = env.BASE_URL;
        const key = env.ENCRYPT_KEY;
        const iv = env.DECRYPT_KEY; 
        const decoded = encode_string;
        const decrypted = cryptoService.decryptCombinedValue(decoded, key, iv);
        const slug = decrypted.slug
        const user_token = decrypted.token;
        const EventParticipantData = await EventParticipantSchema.findOne({ token: user_token });
        if (!EventParticipantData) {
            const event = await eventSchema.findOne({ event_slug: slug }).select('+event_logo +event_image +show_location_image');
            if (event?.event_logo) {
                event.event_logo = baseUrl +'/'+ event.event_logo;

            }
        
            if (event?.event_image) {
                event.event_image = baseUrl +'/'+ event.event_image;
            }

            if (event?.show_location_image) {
                event.show_location_image = baseUrl +'/'+ event.show_location_image;
            }

            const company_visit = await companyActivitySchema.find({ event_id: event ? event._id : 0 });
            const visitReason = await reasonSchema.find({ event_id: event ? event._id : 0  });
            let show_form = true;
            const result = {show_form,event,user_token,slug,company_visit,visitReason}
            return callback(null, result);

        } else {

            let show_form = false;
            const event = await eventSchema.findOne({ event_slug: slug }).select('+event_logo +event_image +show_location_image');
            if (event?.event_logo) {
                event.event_logo = baseUrl +'/'+ event.event_logo;
            }
        
            if (event?.event_image) {
                event.event_image = baseUrl +'/'+event.event_image;
            }
            if (event?.show_location_image) {
                event.show_location_image = baseUrl +'/'+event.show_location_image;
            }
            
            const participantUser = await ParticipantSchema.findOne({ _id: EventParticipantData?.participant_user_id });
            
            const participant_qr_details = JSON.stringify({
                name: participantUser?.first_name + " " + participantUser?.last_name,
                email: participantUser?.email,
                contact_no: participantUser?.contact,
                event: event?.event_title,
                event_address: event?.address,
            });

            const base64Image = await QRCode.toDataURL(participant_qr_details);
            const result = {show_form,event,user_token,slug,EventParticipantData,participantUser,base64Image}
            return callback(null, result);
        }
        
    } catch (error) {
        return callback(error, null);
    }
}

export const getEventParticipantUserListModal = async(slug: string, callback: (error: any, result: any) => void) => {

    try {
        const event = await eventSchema
            .findOne({ event_slug: slug })
            .select("+event_logo +event_image +show_location_image");
    
        if (!event) {
            return callback({ message: "Event not found" }, null); 
        }
    
        const eventParticipants = await EventParticipantSchema.find({
            event_id: event._id,
        });
    
        if (!eventParticipants.length) {
            return callback({ message: "No participants found for this event" }, null); 
        }
    
        const participantUserIds = eventParticipants.map(
            (participant) => participant.participant_user_id
        );
    
        const participants = await ParticipantSchema.find({
            _id: { $in: participantUserIds },
        });
    
        
        return callback(null, { event, participants }); 
    } catch (error) {
        return callback({ message: "An error occurred", error }, null); 
    }
}




