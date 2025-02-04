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
import fs from "fs";

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

const qrDirectory = path.join(__dirname, "..", "..", "..", "..","..","uploads"); 

if (!fs.existsSync(qrDirectory)) {
    fs.mkdirSync(qrDirectory, { recursive: true });
}


export const storeParticipantUser = async (participantUserData: ParticipantUsersData, callback: (error: any, result: any) => void) => {
    try {    
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
            host: "in-v3.mailjet.com", 
            port: 587, 
            secure: false, 
            auth: {
              user: "4ef2e51393517b21366a21e504b1c3b1", 
              pass: "bef9b85cbbe942dc8bce3d8fcddea51a", 
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
                      event_details.event_logo = baseUrl +'/'+ event_details.event_logo;
                  }
              
                  if (event_details?.event_image) {
                      event_details.event_image = baseUrl +'/'+ event_details.event_image;
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
                    const qrFileName = saveQrImage(base64Image, event_participant_details.token);
                    event_participant_details.qr_image = qrFileName;
                    console.log('qrFileName_qrFileName_qrFileName_',qrFileName);
                    await event_participant_details.save();
                    const qr_iamge_url = baseUrl +'/uploads/'+ qrFileName;
                    console.log('qr_iamge_url_qr_iamge_url_qr_iamge_url',qr_iamge_url);
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
                                <img src="`+event_details?.event_logo+`" alt="Event Logo" style="max-width: 100px; height: 100px; border-radius: 10px;">
                            </div>
            
                            <div class="text-center">
                                <p class="heading">`+event_details?.event_title+`</p>
                                <p class="subheading">QR Code Scanner</p>
                            </div>
            
                            <div class="text-center">
                                <img src="`+qr_iamge_url+`" alt="QR Code" class="qr-code">
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
                  const mailOptions = {
                    from: 'rentaltest0@gmail.com', 
                    to: participantUserData.email, 
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


function saveQrImage(base64String: string, fileName: string): string {
    console.log("__dirname__dirname__dirname",__dirname);
    const base64Data = base64String.replace(/^data:image\/png;base64,/, ""); // Remove prefix
    console.log('qrDirectory',)
    const filePath = path.join(qrDirectory, `${fileName}.png`); // File path
    console.log('qrDirectory_qrDirectory_qrDirectory',qrDirectory);
    fs.writeFileSync(filePath, base64Data, 'base64'); // Save file
    return `${fileName}.png`; // Return saved file path
}


