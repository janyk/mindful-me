import { handlerPath } from '@libs/handlerResolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  environment: {
    WHOOP_EMAIL_ADDRESS: '${secrets:email}',
    WHOOP_EMAIL_PASSWORD: '${secrets:password}',
    DATA_LAKE_BUCKET: '${env:DATA_LAKE_BUCKET}',
  },
}
