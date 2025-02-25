import Joi from 'joi';

export const getEventDetailValidation = Joi.object({
    event_slug: Joi.string().required().messages({
        "any.required": "event Slug required is required."
    }),
    sub_domain: Joi.string().required().messages({
        "any.required": "Subdoamin is required."
    }),
});
