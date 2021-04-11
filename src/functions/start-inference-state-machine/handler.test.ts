import { Context, Callback, S3Event, S3EventRecord } from 'aws-lambda'
import { createMock } from 'ts-auto-mock'
import { getJobName, getProcessedDirectory, handler } from '@functions/start-inference-state-machine/handler'

const mockContext = ({} as unknown) as Context

const mockS3EventRecord = createMock<S3EventRecord>({
  eventTime: '2021-04-10T23:56:57.862Z',
  s3: {
    object: {
      key: 'raw/myfile.csv',
      size: 1,
      eTag: 'eTag',
      versionId: '1',
      sequencer: '1',
    },
  },
})

const mockS3Event = createMock<S3Event>({
  Records: [mockS3EventRecord],
})

const mockCallback: Callback = jest.fn()

const mockStartExecution = jest.fn()

jest.mock('aws-sdk', () => ({
  StepFunctions: class StepFunctions {
    startExecution = mockStartExecution.mockReturnThis()
    promise = jest.fn()
  },
}))

describe('Get recovery data lambda', () => {
  beforeEach(() => {
    // uuidv4 function in the handler utilises Math.random for its unique value
    // mocking so our expected params are consistent
    jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should start execution of the state machine with expected parameters', async () => {
    await handler(mockS3Event, mockContext, mockCallback)

    expect(mockStartExecution).toHaveBeenCalledWith({
      stateMachineArn: process.env.STATE_MACHINE_ARN,
      input: JSON.stringify({
        job_name: `${getJobName()}`,
        input_file_path: `s3://${process.env.DATA_LAKE_BUCKET}/${mockS3EventRecord.s3.object.key}`,
        output_file_path: `s3://${process.env.DATA_LAKE_BUCKET}/${getProcessedDirectory(
          mockS3EventRecord.s3.object.key,
        )}`,
      }),
    })
    expect(mockStartExecution).toHaveBeenCalledTimes(1)
  })
})
