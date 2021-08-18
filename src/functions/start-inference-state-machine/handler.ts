import { Context, Callback, S3Event, S3Handler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

import 'source-map-support/register'

const stateMachineArn = process.env.STATE_MACHINE_ARN
const bucket = process.env.DATA_LAKE_BUCKET

/* Starts our inference state machine
 * 1. Triggered on the presence of new recovery data
 * 2. Calculates job parameters for the sagemaker transform job based on eventime and input file data
 * 3. Starts another statemachine with the parameters for the job
 */
export const handler: S3Handler = async (event: S3Event, _context: Context, callback: Callback): Promise<void> => {
  try {
    const stepfunctions = new AWS.StepFunctions()
    const {
      s3: {
        object: { key },
      },
    } = event.Records[0]
    const decodedKey = decodeURIComponent(key)
    const job_name = getJobName()

    const stateMachineExecutionParam: AWS.StepFunctions.StartExecutionInput = {
      stateMachineArn,
      input: JSON.stringify({
        job_name,
        input_file_path: `s3://${bucket}/${decodedKey}`,
        output_file_path: `s3://${bucket}/${getProcessedDirectory(decodedKey)}`,
      }),
    }

    const response = await stepfunctions.startExecution(stateMachineExecutionParam).promise()
    callback(
      null,
      `Your statemachine ${stateMachineArn} executed successfully with execution arn: ${response.executionArn}`,
    )
  } catch (e) {
    callback(e)
  }
}

/* Generates an RFC4122 version 4 compliant uuid
 * Credit to https://stackoverflow.com/a/2117523
 * Suitable for the purposes of this side-project
 */
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/* Generates a unique job name for the batch transform job
 * Note: sagemaker requires job names to be less than 64 characters
 * So be aware of this is you change the prefix for some reason
 */
export const getJobName = (): string => `predict-calories-${uuidv4()}`

/* Returns a path that instructs the sagemaker transform
 * job to output results to our processed partiion in the "date lake"
 */
export const getProcessedDirectory = (filePath: string): string =>
  filePath.replace('raw', 'processed').replace('.csv', '')
