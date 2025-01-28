import mongoose from "mongoose";
import { successCreated, successResponse ,ErrorResponse } from "../../helper/apiResponse";
import participantUsers from "../../domain/schema/participantUsers.schema";
import EventParticipant from "../../domain/schema/eventParticipant";
import { loggerMsg } from "../../lib/logger";
import nodemailer from 'nodemailer';
import path from "path";
import QRCode from "qrcode";
import eventSchema from "../../domain/schema/event.schema";
import { env } from "process";

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

        const transporter = nodemailer.createTransport({
            host: 'in-v3.mailjet.com', 
            port: 587, 
            secure: false, 
            auth: {
              user: '4ef2e51393517b21366a21e504b1c3b1', 
              pass: 'bef9b85cbbe942dc8bce3d8fcddea51a', 
            },
          });

          var token = participantUserData.user_token;
          const baseUrl = env.BASE_URL;

           const event_participant_details = await EventParticipant.findOne({ token });
                  if (!event_participant_details) {
                      return ErrorResponse(baseUrl, "Participant details not found");
                  }
          
                  const event_details = await eventSchema.findOne({ _id: event_participant_details.event_id });
                  if (event_details?.event_logo) {
                      event_details.event_logo = baseUrl + event_details.event_logo;
                  }
              
                  if (event_details?.event_image) {
                      event_details.event_image = baseUrl + event_details.event_image;
                  }
                  const participant_details = await participantUsers.findOne({ _id: event_participant_details.participant_user_id });
          
                  if (!participant_details) {
                      return ErrorResponse(baseUrl, "Participant User not found");
                  }
          
                  const startDates: string[] = event_details?.start_date || []; 
                  const endDates: string[] = event_details?.end_date || []; 
                  const filterDates: string[] = [];
          
                  startDates.forEach((startDate, index) => {
                      const endDate = endDates[index] || null;
          
                      if (startDate) {
                          const start = new Date(startDate);
                          const end = endDate ? new Date(endDate) : null;
          
                          const formattedDate = `${start.toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                          })} - ${start.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                          })} to ${end ? end.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                          }) : ''}`;
          
                          filterDates.push(formattedDate);
                      }
                  });
          
                  console.log(filterDates);
          
                  const detailsHTML = `
                      <ul class="list-unstyled mt-2">
                          ${filterDates.map(date => `<li class="mt-2">${date}</li>`).join('')}
                      </ul>
                  `;
          
                  const participant_qr_details = JSON.stringify({
                      name: participant_details?.first_name + " " + participant_details?.last_name,
                      email: participant_details?.email,
                      contact_no: participant_details?.contact,
                      event: event_details?.event_title,
                      event_address: event_details?.address,
                  });
                  const base64Image = await QRCode.toDataURL(participant_qr_details);
                  console.log('Generated QR Code:', base64Image);
                
                  const htmlContent = `
                  <!DOCTYPE html>
                  <html>
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>`+event_details?.event_title+` QR Code Scanner</title>
                      <style>
                          body {
                              font-family: 'Arial', sans-serif;
                              margin: 0;
                              padding: 0;
                              background-color: #f9f9f9;
                          }
          
                          .container {
                              max-width: 800px;
                              margin: 50px auto;
                              background: white;
                              border: 1px solid #ddd;
                              border-radius: 20px;
                              padding: 20px;
                              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                          }
          
                          .text-center {
                              text-align: center;
                          }
          
                          .heading {
                              font-size: 24px;
                              font-weight: bold;
                              color: #333;
                              margin-bottom: 20px;
                          }
          
                          .subheading {
                              font-size: 16px;
                              font-weight: 500;
                              color: #555;
                          }
          
                          .qr-code {
                              margin: 20px 0;
                              width: 200px;
                              height: auto;
                          }
          
                          .details {
                              font-size: 14px;
                              color: #666;
                              margin-top: 20px;
                          }
          
                          .details img {
                              vertical-align: middle;
                              margin-right: 8px;
                          }
          
                          .button-group {
                              margin-top: 30px;
                              display: flex;
                              justify-content: center;
                              gap: 10px;
                          }
          
                          .button {
                              padding: 10px 20px;
                              font-size: 14px;
                              border-radius: 5px;
                              border: none;
                              cursor: pointer;
                              text-decoration: none;
                              color: white;
                              display: inline-block;
                          }
          
                          .button-primary {
                              background-color: #007bff;
                          }
          
                          .button-secondary {
                              background-color: #6c757d;
                          }
                          .mt-2{
                              margin-bottom: 10px;;
                          }
                          .list-unstyled {
                              list-style: none; 
                              padding-left: 0; 
                              margin: 0;        
                          }
                      </style>
                  </head>
                  <body>
                      <div class="container">
                          <div class="text-center">
                              <img src="{{ $base64Logo = 'data:image/' . pathinfo(getImage($event_data->event_logo), PATHINFO_EXTENSION) . ';base64,' . base64_encode(file_get_contents(getImage($event_data->event_logo)))}}" alt="Event Logo" style="max-width: 100%; height: auto; border-radius: 10px;">
                          </div>
          
                          <div class="text-center">
                              <p class="heading">`+event_details?.event_title+`</p>
                              <p class="subheading">QR Code Scanner</p>
                          </div>
          
                          <div class="text-center">
                              <img src="data:image/png;base64,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" alt="QR Code" class="qr-code">
                          </div>
          
                          <div class="details text-center">
                              <h3>
                                  <b> Event Date: </b>
                              </h3>
                                   `+detailsHTML+`
                              <p>
                                  <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
                                      <path d="M21 10c0 7.333-9 12-9 12s-9-4.667-9-12a9 9 0 1 1 18 0z"></path>
                                      <circle cx="12" cy="10" r="3"></circle>
                                  </svg>
                                  Address: `+event_details?.address+`
                              </p>
                          </div>
          
                          <div class="text-center">
                              <p class="subheading">Participant: `+participant_details?.first_name+` `+participant_details?.last_name+`</p>
                          </div>
                      </div>
                  </body>
                  </html>
                  `;
                  console.log('base64Image_Data',base64Image);
                  const mailOptions = {
                    from: 'rentaltest0@gmail.com', 
                    to: "bhavin@freshcodes.in", 
                    subject: 'Welcome to the Platform!',
                    text: `Hello ${participantUserData.first_name},\n\nThank you for signing up! We're excited to have you onboard.\n\nBest Regards,\nYour Company Name`, // Customize the email body
                    html: htmlContent
                };
                  transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.error('Error sending email:', error);
                      return callback(error, null); 
                    }
                    console.log('Email sent successfully:', info.response);
                    callback(null, { message: 'Participant stored and email sent successfully' }); 
                  });
        
        return callback(null, saveEventParticipants);

    } catch (error) {
        console.log(error);
        loggerMsg("error", `Error during event creation: ${error}`);
        return callback(error, null);  
    }
};


