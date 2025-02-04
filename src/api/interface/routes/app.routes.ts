import express from "express";
import { protectedRoute} from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { storeAdminEvent,updateAdminEvent,getAdminEventDetails  ,getAdminEventList,deleteAdminEvent,generateUniqueURL,generateRegistrationURL,getTokeneventDetails,getParticipantUserList,} from "../../interface/controllers/adminevent.controller";
import { registerUser , loginUser} from "../../interface/controllers/auth.controller";
import { getCountry,getState,getCity } from "../../interface/controllers/location.controller";
import { storeEventParticipantUser ,getUserDetailsUsingEmail,generateEventPdf } from "../../interface/controllers/participantUser.controller";
import { getAdminUser,storeAdminUser,getSingleAdminUser,updateAdminUser,checkEmailUser,deleteAdminUser} from "../../interface/controllers/adminuser.controller";
import { registerUserSchema,loginUserSchema,updateUserSchema } from "../../utils/validation-schems/user.validation";
import { EventParticipantUsers } from "../../utils/validation-schems/event_participant_users.validation";
import { adminEventSchema , adminUpdateEventSchema} from "../../utils/validation-schems/adminevent.validation";
import { uploadImagesFile } from "../../helper/helper";

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
            route.post("/delete-admin-user/:id",protectedRoute,deleteAdminUser);
            //event module urls
            route.post("/save-event-details",protectedRoute,validateRequest(adminEventSchema),storeAdminEvent);
            route.post("/update-event-details",protectedRoute,validateRequest(adminUpdateEventSchema),updateAdminEvent);
            route.get("/get-event-details/:id",protectedRoute,getAdminEventDetails);
            route.get("/delete-event/:id",protectedRoute,deleteAdminEvent);
            route.get("/get-event-list",protectedRoute,getAdminEventList);
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

            //location module urls
            route.get('/get-country',getCountry)
            route.get('/get-state/:id',getState)
            route.get('/get-city/:id',getCity)
            
        } catch (error) {
            // Log any errors that occur during route definition
            console.log(error, 'warn')
        }
    }
