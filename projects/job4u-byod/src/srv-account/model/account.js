const mongoose = require('mongoose')

const schema = new mongoose.Schema(
	{
		phone: { type: String },
		firstName: { type: String },
		lastName: { type: String },
		isDeleted: { type: Boolean, default: false }
	},
	{
		timestamps: true,
		collection: 'account'
	}
)
schema.index({ phone: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } })

module.exports = mongoose.model('account', schema)