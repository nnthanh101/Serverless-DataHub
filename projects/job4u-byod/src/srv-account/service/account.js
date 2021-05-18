const { SUCCESS, ACCOUNT_NOT_FOUND, ACCOUNT_ALREADY_EXISTS } = require('../../common/enum/code')
const { ERROR_CODE } = require('../../common/enum/constant')
const { Account } = require('../model')
const util = require('../../common/util')
const redis = require('../../common/lib/redis')

module.exports.create = async ({ language, data }) => {
  try {
    const check = util.checkSystemError()
    if (check) return check

    await Account.create(data)

    return SUCCESS[language]
  } catch (error) {
    if (error.code == 11000) return ACCOUNT_ALREADY_EXISTS[language]
    return { code: ERROR_CODE, message: error.stack }
  }
}

module.exports.update = async ({ language, data }) => {
  try {
    const check = util.checkSystemError()
    if (check) return check

    const obj = await Account.findOneAndUpdate({ _id: data.id, isDeleted: { $ne: true } }, data)
    if (!obj) return ACCOUNT_NOT_FOUND[language]

    redis.del(`account${obj._id}`)

    return SUCCESS[language]
  } catch (error) {
    if (error.code == 11000) return ACCOUNT_ALREADY_EXISTS[language]
    return { code: ERROR_CODE, message: error.stack }
  }
}

module.exports.findOne = async ({ language, data: { id: _id } }) => {
  try {
    const check = util.checkSystemError()
    if (check) return check

    const key = `account${_id}`
    const cache = await redis.get(key)
    if (cache) return JSON.parse(cache)

    const obj = await Account.findOne({ _id, isDeleted: { $ne: true } })
    if (!obj) return ACCOUNT_NOT_FOUND[language]

    const result = { ...SUCCESS[language], data: obj, source: 'Mongo' }
    redis.set(key, JSON.stringify({ ...result, source: 'Redis' }))

    return result
  } catch (error) {
    return { code: ERROR_CODE, message: error.stack }
  }
}

module.exports.findAll = async ({ language, query, sort, skip, limit }) => {
  try {
    const check = util.checkSystemError()
    if (check) return check

    const [total, list] = await Promise.all([
      Account.countDocuments(query),
      Account.find(query).sort(sort).skip(skip).limit(limit)
    ])

    return { ...SUCCESS[language], total, data: list }
  } catch (error) {
    return { code: ERROR_CODE, message: error.stack }
  }
}

module.exports.delete = async ({ language, data }) => {
  try {
    const check = util.checkSystemError()
    if (check) return check

    const obj = await Account.findOneAndUpdate({ _id: data.id, isDeleted: { $ne: true } }, { isDeleted: true })
    if (!obj) return ACCOUNT_NOT_FOUND[language]

    redis.del(`account${obj._id}`)

    return SUCCESS[language]
  } catch (error) {
    return { code: ERROR_CODE, message: error.stack }
  }
}