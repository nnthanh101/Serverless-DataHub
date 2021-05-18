const { BAD_REQUEST, ERROR } = require('../../common/enum/code')
const { SRV_ACCOUNT } = require('../../common/enum/constant')
const Account = require('../service/account')
const validator = require('../../common/util/validator')
const elastic = require('../../common/lib/elastic')

const express = require('express')
const router = express.Router()
const coll = 'account'
const srv = SRV_ACCOUNT

router.post('/account', async (req, res) => {
  try {
    const { error, value } = validator.account(req.body)
    if (error) {
      return res.send({ ...BAD_REQUEST[req.language], error })
    }

    const body = { data: value, language: req.language }
    elastic.log({ srv, coll, body, method: 'create' })

    const { code, message } = await Account.create(body)

    res.send({ code, message })
  } catch (error) {
    res.send({ ...ERROR[req.language], message: error.stack })
  }
})

router.put('/account/:id', async (req, res) => {
  try {
    const { error, value } = validator.account(req.body)
    if (error) {
      return res.send({ ...BAD_REQUEST[req.language], error })
    }

    value.id = req.params.id

    const body = { data: value, language: req.language }
    elastic.log({ srv, coll, body, method: 'update' })

    const { code, message } = await Account.update(body)

    res.send({ code, message })
  } catch (error) {
    res.send({ ...ERROR[req.language], message: error.stack })
  }
})

router.get('/account/:id', async (req, res) => {
  try {
    const value = {}
    value.id = req.params.id

    const body = { data: value, language: req.language }
    elastic.log({ srv, coll, method: 'findOne' })

    const { code, message, data, source } = await Account.findOne(body)

    res.send({ code, message, data, source })
  } catch (error) {
    res.send({ ...ERROR[req.language], message: error.stack })
  }
})

router.post('/account/paging', async (req, res) => {
  try {
    const body = { ...req.body, language: req.language }
    elastic.log({ srv, coll, method: 'findAll' })

    const { code, message, total, data } = await Account.findAll(body)

    res.send({ code, message, total, data })
  } catch (error) {
    res.send({ ...ERROR[req.language], message: error.stack })
  }
})

router.delete('/account/:id', async (req, res) => {
  try {
    const value = {}
    value.id = req.params.id

    const body = { data: value, language: req.language }
    elastic.log({ srv, coll, body, method: 'delete' })

    const { code, message } = await Account.delete(body)

    res.send({ code, message })
  } catch (error) {
    res.send({ ...ERROR[req.language], message: error.stack })
  }
})

module.exports = router