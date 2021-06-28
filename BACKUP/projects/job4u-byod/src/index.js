const { SRV_ACCOUNT } = require('./common/enum/constant')

function boostrap() {
  switch (process.env.SRV) {
    case SRV_ACCOUNT:
      require('./srv-account/main')
      break
    default:
      console.error('No service !!!')
  }
}

boostrap()