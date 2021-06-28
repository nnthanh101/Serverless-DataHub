const joi = require('@hapi/joi')

module.exports.account = data => {
	const schema = joi.object({
		firstName: joi.string().required(),
		lastName: joi.string().required(),
		phone: joi.string().required(),
	})
	return schema.validate(data, { stripUnknown: true })
}