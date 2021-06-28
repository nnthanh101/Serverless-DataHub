const es = require('@elastic/elasticsearch')
const { ERROR_ELASTIC } = require('../enum/constant')
let client

class Elastic {

  constructor() { }

  async start() {
    if (!process.env.ELASTIC_URI) return

    client = new es.Client({ node: process.env.ELASTIC_URI })

    let isConnected = false;
    while (!isConnected) {
      try {
        await client.cluster.health({});
        isConnected = true;
        console.info('Elasticsearch connected', process.env.ELASTIC_URI)
        process.env[ERROR_ELASTIC] = 0
      } catch (e) {
        if (!process.env[ERROR_ELASTIC]) console.log(e.stack)
        !process.env[ERROR_ELASTIC] && console.error('Elasticsearch disconnected', process.env.ELASTIC_URI)
        process.env[ERROR_ELASTIC] = 1
      }
    }
  }

  async log({ srv, uri, ip, coll, method, body, error, target = 'db' }) {
    if (error && !process.env.ELASTIC_URI) console.error(JSON.stringify({ srv, uri, ip, coll, method, target, body, error }))
    if (Number(process.env[ERROR_ELASTIC]) || isNaN(Number(process.env[ERROR_ELASTIC]))) return
    try {
      await client.index({ index: srv, body: { srv, uri, ip, coll, method, target, body, error, time: new Date() } })
      console.log('Elasticsearch OK')
    } catch (error) { 
      console.error(error.stack)
    }
  }

}

module.exports = new Elastic()
