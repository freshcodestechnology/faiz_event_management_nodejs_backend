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

const formatDate = (dateString: string): { day: number; month: string; year: number } => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date(dateString);
    return {
        day: date.getDate(),
        month: months[date.getMonth()],
        year: date.getFullYear(),
    };
};


export const generateScannerEventPdf = async (req: Request, res: Response) => {
    try {
        const baseUrl = env.BASE_URL;
        const key = env.ENCRYPT_KEY;
        const iv = env.DECRYPT_KEY;
        const { event_slug,user_token } = req.body;

        // const event_slug = "test-event-slug";

        const event_participant_details = await eventParticipant.findOne({ user_token });
        if (!event_participant_details) {
            return ErrorResponse(res, "Participant details not found");
        }

        const event_details = await eventSchema.findOne({ _id: event_participant_details.event_id });
        // const event_details = await eventSchema.findOne({ event_slug: event_slug });
        if (event_details?.event_logo) {
            event_details.event_logo = baseUrl +'/'+ event_details.event_logo;
        }
    
        if (event_details?.event_image) {
            event_details.event_image = baseUrl +'/'+ event_details.event_image;
        }

        if (event_details?.show_location_image) {
            event_details.show_location_image = baseUrl +'/'+ event_details.show_location_image;
        }
        const participant_details = await participantUsers.findOne({ _id: event_participant_details.participant_user_id });

        if (!participant_details) {
            return ErrorResponse(res, "Participant User not found");
        }

        const startDates: string[] = event_details?.start_date || []; 
        const endDates: string[] = event_details?.end_date || []; 
        const getEarliestDate = (dates: string[]): Date => {
            return new Date(dates.reduce((min, date) => 
                new Date(date) < new Date(min) ? date : min
            ));
        };
        
        // Function to find the latest (maximum) date
        const getLatestDate = (dates: string[]): Date => {
            return new Date(dates.reduce((max, date) => 
                new Date(date) > new Date(max) ? date : max
            ));
        };
        
        // Get earliest start date and latest end date
        const earliestStartDate = getEarliestDate(startDates);
        const latestEndDate = getLatestDate(endDates);
        
        // Function to format date with time
        const formatDateTime = (date: Date): string => {
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            return `${day} ${month} ${year} - ${time}`;
        };
        
        // Extracting values
        const earliestStartDay = earliestStartDate.getDate();
        const latestEndDay = latestEndDate.getDate();
        const latestEndMonth = latestEndDate.toLocaleString('default', { month: 'long' });
        const startTime = earliestStartDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const endTime = latestEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        
        // Final formatted output
        const formattedDateRange = `${earliestStartDay} - ${latestEndDay} ${latestEndMonth} ${latestEndDate.getFullYear()} - ${startTime} to ${endTime}`;
        
        console.log(formattedDateRange)
        const participant_qr_details = JSON.stringify({
            user_token:user_token,
            event_id:event_details?.id,
            event_slug:event_details?.event_slug,
        });
        const base64Image = await QRCode.toDataURL(participant_qr_details);

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
            ${filterDates.map(date => `<div class="event-item">${date}</div>`).join('')}
        `;
      
        const htmlContent = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            body {
                                margin: 0;
                                padding: 0;
                                display: flex;
                                background-color: #f0f0f0;
                                font-family: 'Arial', sans-serif;
                            }

                            /* A4 page setup */
                            .a4-container {
                                width: 210mm;
                                height: 297mm;
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                grid-template-rows: 1fr 1fr;
                                grid-gap: 2mm;
                                box-sizing: border-box;
                                background: white;
                                padding: 5mm;
                                border: 1px solid black;
                                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                            }

                            .section {
                                position: relative;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                font-size: 14px;
                                text-align: center;
                                padding: 10px;
                                border: 1px solid #ccc;
                                border-radius: 8px;
                                box-sizing: border-box;
                            }

                            .section_2 {
                                position: relative;
                                display: flex;
                                flex-direction: column;
                                font-size: 14px;
                                padding: 10px;
                                border: 1px solid #ccc;
                                border-radius: 8px;
                                box-sizing: border-box;
                            }

                            .section img {
                                margin-bottom: 10px;
                                width: 70%;
                                height: auto;
                            }

                            .section .heading {
                                font-size: 18px;
                                font-weight: bold;
                                margin-bottom: 5px;
                            }

                            .section .subheading {
                                font-size: 12px;
                                color: #777;
                                margin-bottom: 10px;
                            }

                            .section .event-item {
                                font-size: 12px;
                                margin: 4px;
                            }

                            .section .qr-code {
                                width: 200px;
                                height: auto;
                                margin-top: 10px;
                            }

                            /* Add dashed borders for better visibility */
                            .border-dashed {
                                border: 2px dashed rgb(3, 3, 3);
                            }

                            .text-center {
                                text-align: center;
                            }
                            .content_css h4,.content_css p{    
                                float: left;
                                margin: 0;
                                padding: 0;
                            }
                            .content_css h4{
                                color:  rgb(82 104 49);
                            }
                            .content_css div{
                                margin-top: 2px;
                                text-align: justify;
                                margin-top: 15px;
                            }
                            .content_css p{   
                                margin-top: 15px;
                            font-size: 10px;
                            }
                            .heading_second{
                                font-size: 14px;
                                font-weight: bold;
                                margin-bottom: 5px;
                            }
                            .button {
                                position: absolute!important;
                                left: 20px;
                                bottom: 20px;
                                padding: 10px 20px;
                                background-color: #b7e24a;;
                                color: white;
                                border: none;
                                border-radius: 5px;
                                font-size: 16px;
                                cursor: pointer;
                                transform: rotate(-90deg);
                                margin-left: -55PX;
                                margin-bottom: 21px;
                                border-radius: 0;
                                padding: 11px;
                                font-weight: 700;
                                font-size: 25px;
                            }

                            .button:hover {
                                background-color: #357ABD;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="a4-container">
                        
                            <div class="section border-dashed">
                                <img src="`+event_details?.event_logo+`" alt="Event Logo" style="height: 100px; border-radius: 10px;">
                            
                                <div style="background: #c5cdbe80;
                                width: 100%; font-weight: bold;">
                                    <div class="event-item">`+formattedDateRange+`</div>
                                    <div class="event-item">`+event_details?.address+`</div>
                                </div>
                                <p class="heading">`+participant_details?.first_name+` `+participant_details?.last_name+`</p>
                                <p class="heading_second">(`+participant_details?.designation+`)</p>
                                <img src="`+base64Image+`" alt="QR Code" class="qr-code">
                                <p class="heading_second">Badge Sponsor</p>
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkovjO7QDFTaE5dS4pQkW4jta1FlvfWXwUdg&s" alt="Event Logo" style="height: 80px; border-radius: 10px;">
                                <div class="border-dashed" style="border-color:white;">
                                    <button class="button">VISITOR</button>
                                </div>
                            </div>
                            <div class="section_2 border-dashed content_css" style="float: left;">
                                `+event_details?.getting_show_location+`
                            </div>
                            <div class="section border-dashed">
                                <div class="text-center">
                                    <h2 style="color:#b9b907;">Attend the informative <br> sessions in the <br> conference arena</h2>
                                    <p>Scan the QR code below to view the agenda:</p>
                                    <img src="`+base64Image+`" alt="QR Code" style="height: 100px; height: 200px;">
                                    <hr>
                                    <h4>Date and Time</h4>
                                    `+detailsHTML+`
                                </div>
                            </div>
                            <div class="section border-dashed">
                                <img src="`+event_details?.show_location_image+`" alt="Completed Project" style="width: 100; height: auto;">
                            </div>
                        </div>
                    </body>
                    </html>`;

                    console.log(htmlContent);
            

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
            user_token:token,
            event_id:event_details?.id,
            event_slug:event_details?.event_slug,
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
                    <img src="`+event_details?.event_logo+`" alt="Event Logo" style="height: 100px; border-radius: 10px;">
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
        const {event_id,user_token,type} = req.body;
        const token = user_token;
        
        const event_participant_details = await eventParticipant.findOne({ 
            token: token,       
            event_id: event_id 
          });

        if (!event_participant_details) {
            return ErrorResponse(res, "Participant User not found");
        }

        const event_details = await eventSchema.findOne({ _id: event_participant_details?.event_id });
        if (!event_details) {
            return ErrorResponse(res, "Event Details found");
        }
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

        if(type == 1){
        
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
                user_token:token,
                event_id:event_details?.id,
                event_slug:event_details?.event_slug,
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

        }else{
            return successResponse(res, 'Thank You For Visit this Event.', []);
        }
    } catch (error) {
        console.error("Error generating PDF:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while generating the PDF.",
        });
    }
};

export const getParticipantDetailsScanner = async (req: Request, res: Response) => {
    try {

        const { event_slug, user_token,scanner_type } = req.body;
       
        const event_details = await eventSchema.findOne({ 
            event_slug: event_slug,    
        });

        if (!event_details) {
            return ErrorResponse(res, "Event Details Not Found");
        }

        const event_participant_details = await eventParticipant.findOne({ 
            token: user_token,       
            event_id: event_details._id 
        });

        if (!event_participant_details) {
            return ErrorResponse(res, "Participant User Not Found");
        }

        const baseUrl = env.BASE_URL;
        
        const participant_details = await participantUsers.findOne({ _id: event_participant_details?.participant_user_id });

        if (!participant_details) {
            return ErrorResponse(res, "Participant User Not Found");
        }
        var color_status = "";
        var scanning_msg = "";
        
        if (!event_participant_details) {
            return ErrorResponse(res, "Participant details not found");
        }
        
        if (scanner_type == 0) { // Check-in Process
            if (event_participant_details.status == "in") {
                scanning_msg = "You are already in the event";
                color_status = "yellow";
            } else {
                event_participant_details.checkin_time = new Date();
                event_participant_details.status = "in";
                await event_participant_details.save();
                scanning_msg = "You are now checked into the event";
                color_status = "green";
            }
        }
        
        if (scanner_type == 1) { // Check-out Process
            if (event_participant_details.status != "in") {
                scanning_msg = "You can't check out without checking in";
                color_status = "red";
            } else {
                event_participant_details.checkout_time = new Date();
                event_participant_details.status = "out";
                await event_participant_details.save();
                scanning_msg = "You are now checked out from the event";
                color_status = "green";
            }
        }        
        event_participant_details.qr_image = baseUrl +'/uploads/'+ event_participant_details.qr_image;
        const resutl = [];
        event_details.event_logo= `${env.BASE_URL}/${event_details.event_logo}`
        event_details.event_image= `${env.BASE_URL}/${event_details.event_image}`
        resutl.push(event_details);
        resutl.push(event_participant_details);
        resutl.push(participant_details);
        resutl.push({"color_status":color_status,"scanning_msg":scanning_msg});
        return successResponse(res, 'Participant User Details', resutl);

    } catch (error) {

        console.error("Error generating PDF:", error);

        return res.status(500).json({
            status: "error",
            message: "An error occurred while generating the PDF.",
        });

    }
};
