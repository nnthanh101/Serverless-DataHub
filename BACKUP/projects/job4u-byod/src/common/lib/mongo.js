const mongoose = require('mongoose')
const { ERROR_MONGO } = require('../enum/constant')
const fs = require('fs')

class Mongo {

	constructor() {
		if (!process.env.MONGO_URI) return

		mongoose.Promise = global.Promise

		mongoose.connect(process.env.MONGO_URI, {
			sslValidate: true,
			sslCA: [fs.readFileSync(__dirname + "/rds-combined-ca-bundle.pem")],
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		})

		mongoose.connection.on('error', (e) => {
			if (!process.env[ERROR_MONGO]) console.log(e.stack)
		})

		mongoose.connection.on('connected', () => {
			console.log('Database connected', process.env.MONGO_URI)
			process.env[ERROR_MONGO] = 0
		})

		mongoose.connection.on('disconnected', () => {
			!process.env[ERROR_MONGO] && console.error('Database disconnected', process.env.MONGO_URI)
			process.env[ERROR_MONGO] = 1
		})
	}

}

module.exports = new Mongo()