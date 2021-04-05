import { Context, Callback, S3Event, S3Handler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import 'source-map-support/register'

const stepfunctions = new AWS.StepFunctions()
const stateMachineArn = process.env.STATE_MACHINE_ARN
const bucket = process.env.DATA_LAKE_BUCKET

export const handler: S3Handler = async (event: S3Event, _context: Context, callback: Callback): Promise<any> => {
  try {
    const {
      s3: {
        object: { key },
      },
      eventTime,
    } = event.Records[0]
    const decodedKey = decodeURIComponent(key)

    const stateMachineExecutionParam: AWS.StepFunctions.StartExecutionInput = {
      stateMachineArn,
      input: JSON.stringify({
        job_name: `${eventTime.split('T')[0]}-job-test-now`,
        input_file_path: `s3://${bucket}/${decodedKey}`,
        output_file_path: `s3://${bucket}/${decodedKey.replace('raw', 'processed').replace('.csv', '')}`,
      }),
    }

    await stepfunctions.startExecution(stateMachineExecutionParam).promise()
    callback(null, `Your statemachine ${stateMachineArn} executed successfully`)
  } catch (e) {
    callback(e)
  }
}
