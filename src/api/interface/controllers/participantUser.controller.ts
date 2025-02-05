import { Request, Response } from "express";
import { successCreated, successResponse ,ErrorResponse } from "../../helper/apiResponse";
import { storeParticipantUser } from "../../domain/models/participantUser.model";
import participantUsers from "../../domain/schema/participantUsers.schema";
import eventParticipant from "../../domain/schema/eventParticipant";
import eventSchema from "../../domain/schema/event.schema";
import { env } from "process";
import multer from "multer"
import fs from "fs";
import { cryptoService } from "../../services/cryptoService";
import puppeteer from "puppeteer";
import path from "path";
import QRCode from "qrcode";


interface FileWithBuffer extends Express.Multer.File {
buffer: Buffer;
}
  
const upload = multer();

export const storeEventParticipantUser = async (req: Request, res: Response) => {
    try {
        
        storeParticipantUser(req.body, (error:any, result:any) => {
            if (error) {
                return res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error instanceof Error ? error.message : "An unexpected error occurred."
                });
            }
            return successCreated(res, result)
        });
    } catch (error) {
       
    }
};

export const getUserDetailsUsingEmail = async (req: Request, res: Response) => {
    try {
        
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                status: "error",
                message: "Email is required.",
            });
        }

        const user = await participantUsers.findOne({ email });

        if (!user) {
            return ErrorResponse(res, "Participant User not found");
        }

        return successResponse(res, 'Get Participant User List', user);
    } catch (error) {
       
    }
};

export const generateEventPdf = async (req: Request, res: Response) => {
    try {
        const baseUrl = env.BASE_URL;
        const { encrypt_token } = req.params;

        if (!encrypt_token) {
            return res.status(400).json({
                status: "error",
                message: "Token is required.",
            });
        }

        const key = env.ENCRYPT_KEY;
        const iv = env.DECRYPT_KEY;
        const decoded = encrypt_token;
        const decrypted = cryptoService.decryptCombinedValue(decoded, key, iv);
        const { slug, token } = decrypted;

        const event_participant_details = await eventParticipant.findOne({ token });
        if (!event_participant_details) {
            return ErrorResponse(res, "Participant details not found");
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
            return ErrorResponse(res, "Participant User not found");
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
            user_token:token,
            event_id:event_details?.id,
        });
        const base64Image = await QRCode.toDataURL(participant_qr_details);
   
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
                    <img src="`+base64Image+`" alt="QR Code" class="qr-code">
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

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], 
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('screen');
        let file_name = participant_details.first_name + "_" + participant_details.last_name + "_event_details.pdf";
        const tempFilePath = path.join(__dirname, file_name);
        const pdfBuffer = await page.pdf({
            path: tempFilePath,
            printBackground: true,  
            format: 'A4',
        });

        await browser.close();
        const filePath = path.join(__dirname, file_name); 

        if (fs.existsSync(filePath)) {
            res.set({
                'Content-Type': 'application/pdf',  
                'Content-Disposition': 'attachment; filename="'+file_name+'"', 
            });
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
            res.on('finish', () => {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting the file:', err);
                    } else {
                        console.log('File deleted successfully after download');
                    }
                });
            });
        } else {
            res.status(404).send('File not found');
        }

    } catch (error) {
        console.error("Error generating PDF:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while generating the PDF.",
        });
    }
};

export const getParticipantDetails = async (req: Request, res: Response) => {
    try {
        const baseUrl = env.BASE_URL;
        const {event_id,user_token} = req.body;
        const token = user_token;
        const event_participant_details = await eventParticipant.findOne({ 
            token: token,       
            event_id: event_id 
          });

        const event_details = await eventSchema.findOne({ _id: event_participant_details?.event_id });
        if (event_details?.event_logo) {
            event_details.event_logo = baseUrl +'/'+ event_details.event_logo;
        }
    
        if (event_details?.event_image) {
            event_details.event_image = baseUrl +'/'+ event_details.event_image;
        }
        const participant_details = await participantUsers.findOne({ _id: event_participant_details?.participant_user_id });

        if (!participant_details) {
            return ErrorResponse(res, "Participant User not found");
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
            user_token:token,
            event_id:event_details?.id,
        });
        const base64Image = await QRCode.toDataURL(participant_qr_details);
   
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
                    <img src="`+base64Image+`" alt="QR Code" class="qr-code">
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

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], 
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('screen');
        let file_name = participant_details.first_name + "_" + participant_details.last_name + "_event_details.pdf";
        const tempFilePath = path.join(__dirname, file_name);
        const pdfBuffer = await page.pdf({
            path: tempFilePath,
            printBackground: true,  
            format: 'A4',
        });

        await browser.close();
        const filePath = path.join(__dirname, file_name); 

        if (fs.existsSync(filePath)) {
            res.set({
                'Content-Type': 'application/pdf',  
                'Content-Disposition': 'attachment; filename="'+file_name+'"', 
            });
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
            res.on('finish', () => {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting the file:', err);
                    } else {
                        console.log('File deleted successfully after download');
                    }
                });
            });
        } else {
            res.status(404).send('File not found');
        }
    } catch (error) {
        console.error("Error generating PDF:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while generating the PDF.",
        });
    }
};
