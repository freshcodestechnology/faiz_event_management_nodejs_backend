import express from "express";
import { protectedRoute} from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { storeAdminEvent,updateAdminEvent,getAdminEventDetails  ,getAdminEventList,deleteAdminEvent,generateUniqueURL,generateRegistrationURL,getTokeneventDetails,getParticipantUserList,getAllParticipantUserList,UpdateExtraEventDetails,GetExtraEventDetails} from "../../interface/controllers/adminevent.controller";
import { registerUser , loginUser} from "../../interface/controllers/auth.controller";
import { getCountry,getState,getCity,importXlsxData,getHomePageCity } from "../../interface/controllers/location.controller";
import { getSetting , updateSetting } from "../../interface/controllers/setting.controller";
import { storeScannerMachine,updateScannerMachine,deleteScannerMachine,getScannerMachine,assignScannerMachine,removeAssignScannerMachine,getScannerMachineDetails,checkUniqueMachineId } from "../../interface/controllers/scannerMachine.controller";
import { storeCompanyController,getCompany,getCompanyDetails,updateCompanyController,deleteCompany,updateCompanyStatus } from "../../interface/controllers/company.controller";

import { getEventDetailsSlug,scannerPageLogin } from "../../interface/controllers/ScannerPage.controller";
import { storeEventParticipantUser ,getUserDetailsUsingEmail,generateEventPdf,generateScannerEventPdf,getParticipantDetails,getParticipantDetailsScanner,scanFaceId,scanParticipantFace } from "../../interface/controllers/participantUser.controller";
import { getAdminUser,storeAdminUser,getSingleAdminUser,updateAdminUser,checkEmailUser,deleteAdminUser,forgetPassword,setPassword,updateUserStatus,changePassword} from "../../interface/controllers/adminuser.controller";
import { registerUserSchema,loginUserSchema,updateUserSchema,forgetPasswordSchema,setPasswordSchema,updateStatusUserSchema,deleteUsersSchema,changePasswordSchema,scannerPageLoginUserSchema} from "../../utils/validation-schems/user.validation";
import { EventParticipantUsers } from "../../utils/validation-schems/event_participant_users.validation";
import { adminEventSchema , adminUpdateEventSchema,deleteEventSchema,extraEventDetails,updateExtraEventDetails} from "../../utils/validation-schems/adminevent.validation";
import { uploadImagesFile } from "../../helper/helper";
import { settingSchema } from "../../utils/validation-schems/setting.validation";
import { updateCompanySchema , registerCompanySchema,deleteCompanySchema ,updateStatusCompanySchema} from "../../utils/validation-schems/company.validation";
import { getParticipantDetailsSchema } from "../../utils/validation-schems/participantDetails.validation";
import { addScannerMachineSchema,updateScannerMachineSchema,deleteScannerMachineSchema,assignScannerMachineSchema } from "../../utils/validation-schems/scannerMachine.validation";
import { scannerData ,scannerGetData} from "../../utils/validation-schems/scannerData.validation";
import { blogValidation,updateBlogValidation,homeBlogdetailsValidation,deleteEventBlog } from "../../utils/validation-schems/blogValidation.validation";
import { getEventBlog,storeBlogController,eventBlogDetailsController, updateBlogController,locationWiseEventList,locationWiseBlogDetails,deleteEventBlogController} from "../../interface/controllers/eventBlog.conroller";
import { storeAdminCompanyController,getAdminCompanyList,getAdminCompanyDetails,updateAdminCompanyController,deleteAdminCompanyController } from "../../interface/controllers/adminCompany.controller";
import {  storeCompanyTeamController , updateCompanyTeamController,deleteCompanyTeamController,getCompanyTeamDetails,getCompanyTeamList } from "../../interface/controllers/companyTeam.controller";
import { adminCompanySchema,updateAdminCompanySchema,deleteAdminCompanySchema } from "../../utils/validation-schems/adminCompanySchema.validation";
import { companyTeamSchema,updateCompanyTeamSchema,deleteCompanyTeamSchema } from "../../utils/validation-schems/companyTeamSchema.validation";
import { getEventDetailValidation,scanParticipantFaceSchema } from "../../utils/validation-schems/scannerPage.validation";



// import { getUsersProfiles, imageCaptionUpdate, imageUpload, removeImages, removeSingleImage, setProfileImage, updateUserProfile } from "../controllers/user.controller";
    const route = express.Router();

    export const appRoute = (router: express.Router): void => {
        try {

            router.use('/v1', route)
            
            //auth urls

            //Admin company module

            route.post('/store-admin-company',protectedRoute,validateRequest(adminCompanySchema),storeAdminCompanyController);
            route.get('/get-admin-company-list',protectedRoute,getAdminCompanyList);
            route.get('/get-admin-company-details/:id',protectedRoute,getAdminCompanyDetails);
            route.post('/update-admin-company',protectedRoute,validateRequest(updateAdminCompanySchema),updateAdminCompanyController);
            route.post('/delete-admin-company',protectedRoute,validateRequest(deleteAdminCompanySchema),deleteAdminCompanyController);

            route.get('/get-company-team-list',protectedRoute,getCompanyTeamList);
            route.post('/store-company-team',protectedRoute,validateRequest(companyTeamSchema),storeCompanyTeamController);
            route.post('/update-company-team',protectedRoute,validateRequest(updateCompanyTeamSchema),updateCompanyTeamController);
            route.get('/get-company-team-details/:id',protectedRoute,getCompanyTeamDetails);
            route.post('/delete-company-team',protectedRoute,validateRequest(deleteCompanyTeamSchema),deleteCompanyTeamController);

            
            route.post("/register",validateRequest(registerUserSchema),registerUser);
            route.post("/login",validateRequest(loginUserSchema),loginUser);
            route.post("/logout",validateRequest(loginUserSchema),loginUser);

            //email validation api

            route.get("/check-email", protectedRoute ,checkEmailUser);

            //admin users url
            route.get("/get-admin-user-list", protectedRoute ,getAdminUser);
            
            route.post("/save-admin-users",protectedRoute,validateRequest(registerUserSchema),storeAdminUser);
            route.get("/get-single-admin-users/:id",protectedRoute,getSingleAdminUser);
            route.post("/update-admin-users",protectedRoute,validateRequest(updateUserSchema),updateAdminUser);
            route.post("/delete-admin-user",protectedRoute,validateRequest(deleteUsersSchema),deleteAdminUser);
            route.post("/update-user-status", protectedRoute,validateRequest(updateStatusUserSchema), updateUserStatus)

            //event module urls
            route.post("/save-event-details",protectedRoute,validateRequest(adminEventSchema),storeAdminEvent);
            route.post("/update-event-details",protectedRoute,validateRequest(adminUpdateEventSchema),updateAdminEvent);
            route.get("/get-event-details/:id",protectedRoute,getAdminEventDetails);
            // route.get("/delete-event/:id",protectedRoute,deleteAdminEvent);
            route.get("/get-event-list",protectedRoute,getAdminEventList);
            route.post("/delete-event", protectedRoute,validateRequest(deleteEventSchema), deleteAdminEvent)
            route.get("/get-paticipant-user-list/:token",protectedRoute,getParticipantUserList);
            route.get("/get-all-paticipant-user-list",protectedRoute,getAllParticipantUserList);
            route.post("/update-extra-event-details",protectedRoute,validateRequest(updateExtraEventDetails),UpdateExtraEventDetails);
            route.post("/get-extra-event-details",protectedRoute,validateRequest(extraEventDetails),GetExtraEventDetails);
            
            //unique url generate
            route.get("/generate-unique-url/:slug",protectedRoute,generateUniqueURL);
            route.get("/get-event-details-using-token/:token",getTokeneventDetails);
            route.get("/get-registration-url/:slug",generateRegistrationURL);

            //store participant urls
            route.get("/getuser",getTokeneventDetails);
            route.get("/get-user-details/:email",getUserDetailsUsingEmail);
            route.post("/store-participant-details",validateRequest(EventParticipantUsers),storeEventParticipantUser);
            route.get("/generate-event-pdf/:encrypt_token",generateEventPdf);
            route.post("/generate-event-pdf-scanner",validateRequest(scannerGetData),generateScannerEventPdf);            

            //location module urls
            route.get('/get-country',getCountry)
            route.get('/get-state/:id',getState)
            route.get('/get-city/:id',getCity)
            route.get('/scanner-page',getSetting)
            route.post("/importXlsxData",importXlsxData)
            route.post('/update-button-setting',validateRequest(settingSchema),updateSetting)
            route.post('/get-praticipent-details',validateRequest(getParticipantDetailsSchema),getParticipantDetails)
            
            //company Module urls
            route.post("/store-company", protectedRoute ,validateRequest(registerCompanySchema),storeCompanyController);
            route.get('/get-company-list' ,getCompany)
            route.get('/get-company-details/:company_id',protectedRoute ,getCompanyDetails)
            route.post("/update-company-details/:company_id", protectedRoute, validateRequest(updateCompanySchema),updateCompanyController)
            route.post("/delete-company", protectedRoute,validateRequest(deleteCompanySchema), deleteCompany)
            route.post("/update-company-status", protectedRoute,validateRequest(updateStatusCompanySchema), updateCompanyStatus)
            route.post("/get-scanner-data-details",validateRequest(scannerData), getParticipantDetailsScanner)

            //forget password
            route.post("/forget-password",validateRequest(forgetPasswordSchema),forgetPassword);
            route.post("/set-password",validateRequest(setPasswordSchema),setPassword);

            //scanner machine module
            route.post("/add-scanner-machine",protectedRoute,validateRequest(addScannerMachineSchema),storeScannerMachine);
            route.post("/update-scanner-machine",protectedRoute,validateRequest(updateScannerMachineSchema),updateScannerMachine);
            route.post("/get-scanner-machine-list",protectedRoute,setPassword);
            route.post("/delete-scanner-machine",protectedRoute,validateRequest(deleteScannerMachineSchema),deleteScannerMachine);
            route.get("/get-scanner-machine-list",protectedRoute,getScannerMachine);
            route.post("/assign-scanner-machine",protectedRoute,validateRequest(assignScannerMachineSchema),assignScannerMachine);
            route.post("/remove-assign-scanner-machine",protectedRoute,validateRequest(deleteScannerMachineSchema),removeAssignScannerMachine);
            route.get('/get-scanner-machine/:scanner_machine_id',protectedRoute ,getScannerMachineDetails)
            route.get("/check-scanner-machine", protectedRoute ,checkUniqueMachineId);
            route.post("/scan-face-id" ,scanFaceId);
            route.post("/scan-participant-face",validateRequest(scanParticipantFaceSchema),scanParticipantFace);
            
            route.post('/get-event-details-slug',validateRequest(getEventDetailValidation),getEventDetailsSlug);
            
            //scannerPageLogin
            route.post("/scanner-page-login",validateRequest(scannerPageLoginUserSchema),scannerPageLogin);

            //changePasswordSchema
            route.post("/change-password",protectedRoute,validateRequest(changePasswordSchema),changePassword);
            
            //levenex blogs
            route.get("/blogs-listing",protectedRoute,getEventBlog);
            route.post("/add-blog",protectedRoute,validateRequest(blogValidation),storeBlogController);
            route.post("/update-blog",protectedRoute,validateRequest(updateBlogValidation),updateBlogController);
            route.get("/blog-details/:id",protectedRoute,eventBlogDetailsController);
            route.post("/delete-event-blog", protectedRoute,validateRequest(deleteEventBlog),deleteEventBlogController)

            //show frontend side
            route.get('/get-homepage-cities-data',getHomePageCity);
            route.get("/event-blog-listing",locationWiseEventList)
            route.post("/home-page-blog-details",validateRequest(homeBlogdetailsValidation),locationWiseBlogDetails)
            
        } catch (error) {
            // Log any errors that occur during route definition
            console.log(error, 'warn')
        }
    }
