import { handlerPath } from '@libs/handlerResolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  environment: {
    WHOOP_EMAIL_ADDRESS: '${env:WHOOP_EMAIL}',
    WHOOP_EMAIL_PASSWORD: '${env:WHOOP_PASSWORD}',
    DATA_LAKE_BUCKET: '${env:DATA_LAKE_BUCKET}',
    TIMEZONE: '${env:TIMEZONE}',
  },
}
