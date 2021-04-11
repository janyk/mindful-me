import { handlerPath } from '@libs/handlerResolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      s3: {
        bucket: '${env:DATA_LAKE_BUCKET}',
        event: 's3:ObjectCreated:*',
        rules: [{ prefix: 'processed' }],
      },
    },
  ],
  environment: {
    CALORIE_LIMIT: '${env:CALORIE_LIMIT}',
    NOTIFICATION_ADDRESS: '${env:NOTIFICATION_ADDRESS}',
  },
}
