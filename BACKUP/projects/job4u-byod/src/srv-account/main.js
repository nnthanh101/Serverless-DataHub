require('../common/lib/mongo')
const redis = require('../common/lib/redis')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const util = require('../common/util')
const { API_NOT_FOUND } = require('../common/enum/code')
const { ERROR_CODE, LANGUAGE, VI, SRV_ACCOUNT } = require('../common/enum/constant')

const elastic = require('../common/lib/elastic')
elastic.start()

const test = async () => {
  try {
    const accountService = require('./service/account')
    await accountService.create({
      language: 'vi', data: {
        phone: '0938203080' + Date.now(),
        firstName: 'Thanh',
        lastName: 'Nguyen'
      }
    })

    const l = await accountService.findAll({ language: 'vi' })
    console.log('DocumentDB:===', JSON.stringify(l))

    await redis.set('abc', 1)
    console.log('Redis Test:====', await redis.get('abc'))
    
    elastic.log({srv: 'test'})
  } catch (e) {
    console.error(e.stack)
  }
}
setTimeout(() => {
  test()
}, 10000);

const app = express()
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use((req, res, next) => {
  const check = util.checkSystemError()
  if (check) return res.send(check)

  const language = req.headers['accept-language']
  req.language = LANGUAGE.test(language) ? language.toString().toUpperCase() : VI

  const { protocol, hostname, url, ip, method } = req
  elastic.log({ srv: SRV_ACCOUNT, uri: `${protocol}://${hostname}${url}`, ip, method, target: 'gw' })

  next()
})
app.use('/srv-account', require('./route'))
app.use((req, res, next) => res.send({ ...API_NOT_FOUND[req.language], srv: SRV_ACCOUNT }))
app.use((err, req, res, next) => res.send({ code: ERROR_CODE, message: err.message }))
app.listen(process.env.PORT, () => console.log(`App listening at http://localhost:${process.env.PORT}`))