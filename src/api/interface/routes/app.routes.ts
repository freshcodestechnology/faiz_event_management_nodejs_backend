import express from "express";
import { protectedRoute} from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { storeAdminEvent,updateAdminEvent,getAdminEventDetails  ,getAdminEventList,deleteAdminEvent,generateUniqueURL,generateRegistrationURL,getTokeneventDetails,getParticipantUserList} from "../../interface/controllers/adminevent.controller";
import { registerUser , loginUser} from "../../interface/controllers/auth.controller";
import { getCountry,getState,getCity } from "../../interface/controllers/location.controller";
import { getSetting , updateSetting } from "../../interface/controllers/setting.controller";
import { storeScannerMachine,updateScannerMachine,deleteScannerMachine,getScannerMachine,assignScannerMachine,removeAssignScannerMachine,getScannerMachineDetails,checkUniqueMachineId } from "../../interface/controllers/scannerMachine.controller";
import { storeCompanyController,getCompany,getCompanyDetails,updateCompanyController,deleteCompany,updateCompanyStatus } from "../../interface/controllers/company.controller";

import { getEventDetailsSlug,scannerPageLogin } from "../../interface/controllers/ScannerPage.controller";
import { storeEventParticipantUser ,getUserDetailsUsingEmail,generateEventPdf,generateScannerEventPdf,getParticipantDetails,getParticipantDetailsScanner } from "../../interface/controllers/participantUser.controller";
import { getAdminUser,storeAdminUser,getSingleAdminUser,updateAdminUser,checkEmailUser,deleteAdminUser,forgetPassword,setPassword,updateUserStatus,changePassword} from "../../interface/controllers/adminuser.controller";
import { registerUserSchema,loginUserSchema,updateUserSchema,forgetPasswordSchema,setPasswordSchema,updateStatusUserSchema,deleteUsersSchema,changePasswordSchema,scannerPageLoginUserSchema} from "../../utils/validation-schems/user.validation";
import { EventParticipantUsers } from "../../utils/validation-schems/event_participant_users.validation";
import { adminEventSchema , adminUpdateEventSchema,deleteEventSchema} from "../../utils/validation-schems/adminevent.validation";
import { uploadImagesFile } from "../../helper/helper";
import { settingSchema } from "../../utils/validation-schems/setting.validation";
import { updateCompanySchema , registerCompanySchema,deleteCompanySchema ,updateStatusCompanySchema} from "../../utils/validation-schems/company.validation";
import { getParticipantDetailsSchema } from "../../utils/validation-schems/participantDetails.validation";
import { addScannerMachineSchema,updateScannerMachineSchema,deleteScannerMachineSchema,assignScannerMachineSchema } from "../../utils/validation-schems/scannerMachine.validation";
import { scannerData } from "../../utils/validation-schems/scannerData.validation";
import { getEventDetailValidation } from "../../utils/validation-schems/scannerPage.validation";



// import { getUsersProfiles, imageCaptionUpdate, imageUpload, removeImages, removeSingleImage, setProfileImage, updateUserProfile } from "../controllers/user.controller";
    const route = express.Router();

    export const appRoute = (router: express.Router): void => {
        try {

            router.use('/v1', route)
            
            //auth urls

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

            //unique url generate
            route.get("/generate-unique-url/:slug",protectedRoute,generateUniqueURL);
            route.get("/get-event-details-using-token/:token",getTokeneventDetails);
            route.get("/get-registration-url/:slug",generateRegistrationURL);

            //store participant urls
            route.get("/getuser",getTokeneventDetails);
            route.get("/get-user-details/:email",getUserDetailsUsingEmail);
            route.post("/store-participant-details",validateRequest(EventParticipantUsers),storeEventParticipantUser);
            route.get("/generate-event-pdf/:encrypt_token",generateEventPdf);
            route.post("/generate-event-pdf-scanner",generateScannerEventPdf);

            //location module urls
            route.get('/get-country',getCountry)
            route.get('/get-state/:id',getState)
            route.get('/get-city/:id',getCity)
            route.get('/scanner-page',getSetting)
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

            route.post('/get-event-details-slug',validateRequest(getEventDetailValidation),getEventDetailsSlug);
            
            //scannerPageLogin
            route.post("/scanner-page-login",validateRequest(scannerPageLoginUserSchema),scannerPageLogin);

            //changePasswordSchema
            route.post("/change-password",protectedRoute,validateRequest(changePasswordSchema),changePassword);
            

        } catch (error) {
            // Log any errors that occur during route definition
            console.log(error, 'warn')
        }
    }
