const { ERROR_MONGO, ERROR_REDIS, ERROR_ELASTIC, ERROR_CODE } = require('../enum/constant')

class Util {

	checkSystemError() {
		const message = []
		if (Number(process.env[ERROR_REDIS])) message.push('Redis')
		if (Number(process.env[ERROR_MONGO])) message.push('Mongo')
		if (Number(process.env[ERROR_ELASTIC])) message.push('Elastic')
		if (message.length) return { code: ERROR_CODE, message: `${message} Disconnected` }
		return false
	}

}

module.exports = new Util()