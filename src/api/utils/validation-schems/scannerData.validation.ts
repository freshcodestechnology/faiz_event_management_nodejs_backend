import Joi from 'joi';

export const scannerData = Joi.object({
    event_slug: Joi.string().required().messages({
        "any.required": "event Slug required is required."
    }),
    user_token: Joi.string().required().messages({
        "any.required": "user token is required."
    }),
});