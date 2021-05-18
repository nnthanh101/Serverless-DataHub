const ioredis = require('ioredis')
const { ERROR_REDIS } = require('../enum/constant')
let client

class Redis {

	constructor() {
		if (!process.env.REDIS_URI) return

		// // Alone
		// client = new ioredis(process.env.REDIS_URI, {
		// 	retryStrategy: () => 1000
		// })

		// Cluster
		client = new ioredis.Cluster([process.env.REDIS_URI], {
			retryStrategy: () => 1000
		})

		client.on('ready', () => {
			console.info('Redis connected', process.env.REDIS_URI)
			process.env[ERROR_REDIS] = 0
		})

		client.on('error', () => {
			!process.env[ERROR_REDIS] && console.error('Redis disconnected', process.env.REDIS_URI)
			process.env[ERROR_REDIS] = 1
		})
	}

	set(key, value, expire = 86400) {
		if (Number(process.env[ERROR_REDIS]) || isNaN(Number(process.env[ERROR_REDIS]))) return
		return client.set(key, value, 'EX', expire)
	}

	get(key) {
		if (Number(process.env[ERROR_REDIS]) || isNaN(Number(process.env[ERROR_REDIS]))) return
		return client.get(key)
	}

	del(key) {
		if (Number(process.env[ERROR_REDIS]) || isNaN(Number(process.env[ERROR_REDIS]))) return
		return client.del(key)
	}

}

module.exports = new Redis()