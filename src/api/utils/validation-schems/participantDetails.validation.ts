import Joi from 'joi';

export const getParticipantDetailsSchema = Joi.object({
    event_id: Joi.string().required().messages({
        "any.required": "Event Id is required.",
        "string.base": "Event Id must be a string."
    }),
       user_token: Joi.string().required().messages({
           "any.required": "User Token is required.",
           "string.base": "User Token must be a string."
       }),
    });
    