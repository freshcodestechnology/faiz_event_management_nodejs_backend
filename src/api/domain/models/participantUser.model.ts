import mongoose from "mongoose";
import participantUsers from "../../domain/schema/participantUsers.schema";
import EventParticipant from "../../domain/schema/eventParticipant";
import { loggerMsg } from "../../lib/logger";

interface ParticipantUsersData {
    first_name: string;
    last_name: string;
    email: string;
    designation: string;
    organization: string;
    contact: string;
    country: string;
    state: string;
    city: string;
    address: string;
    visit_reason: string;
    referral_source?: string;
    company_activity: string;
    user_token?: string;
    event_id?: string;
}


export const storeParticipantUser = async (participantUserData: ParticipantUsersData, callback: (error: any, result: any) => void) => {
    try {    
        console.log(participantUserData);
        const existingUser = await participantUsers.findOne({ email: participantUserData.email });
        if (existingUser) {
          
            existingUser.first_name = participantUserData.first_name;
            existingUser.last_name = participantUserData.last_name;
            existingUser.designation = participantUserData.designation;
            existingUser.organization = participantUserData.organization;
            existingUser.contact = participantUserData.contact;
            existingUser.country = participantUserData.country;
            existingUser.state = participantUserData.state;
            existingUser.city = participantUserData.city;
            existingUser.address = participantUserData.address;

            const updatedUser = await existingUser.save();

        } else {
          
            const newParticipantUser = new participantUsers({
                first_name: participantUserData.first_name,
                last_name: participantUserData.last_name,
                email: participantUserData.email,
                designation: participantUserData.designation,
                organization: participantUserData.organization,
                contact: participantUserData.contact,
                country: participantUserData.country,
                state: participantUserData.state,
                city: participantUserData.city,
                address: participantUserData.address
            });

            const savedUser = await newParticipantUser.save();

        }

        const existingUserId = await participantUsers
        .findOne({ email: participantUserData.email })
        .select('_id');
        
        const EventParticipants = new EventParticipant({
            participant_user_id :existingUserId?._id,
            event_id : participantUserData.event_id,
            token : participantUserData.user_token,
            visit_reason : participantUserData.visit_reason,
            referral_source : participantUserData.referral_source,
            company_activity : participantUserData.company_activity
        });

        const saveEventParticipants = await EventParticipants.save();
        
        return callback(null, saveEventParticipants);

    } catch (error) {
        console.log(error);
        loggerMsg("error", `Error during event creation: ${error}`);
        return callback(error, null);  
    }
};


