import { handlerPath } from '@libs/handlerResolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  environment: {
    STATE_MACHINE_ARN: '${self:resources.Outputs.InferenceStateMachine.Value}',
    DATA_LAKE_BUCKET: '${env:DATA_LAKE_BUCKET}',
  },
  events: [
    {
      s3: {
        bucket: '${env:DATA_LAKE_BUCKET}',
        event: 's3:ObjectCreated:*',
        rules: [{ prefix: 'raw' }],
      },
    },
  ],
}
