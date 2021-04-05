import { Context, Callback, ScheduledEvent } from 'aws-lambda'
import { createMock } from 'ts-auto-mock';
import { handler } from '@functions/get-recovery-data/handler'
import { WhoopCycle } from '@libs/whoop/types';

// kind of filthy, but none of these arguments properties are being used so no need to mock them
const mockContext = ({} as unknown) as Context
const mockScheduledEvent = ({} as unknown) as ScheduledEvent

const mockCallback: Callback = jest.fn()
const mockGetMostRecentCycle = jest.fn()

jest.mock('@libs/whoop', () => ({
  default: jest.fn(() => ({
    login: jest.fn(),
    getMostRecentCycle: mockGetMostRecentCycle,
    getCycles: jest.fn(),
  })),
}))

const mockS3PutObject = jest.fn()
jest.mock('aws-sdk', () => ({
  S3: function S3() {
    this.putObject = mockS3PutObject.mockReturnThis()
    this.promise = jest.fn()
  },
}))

describe('Get recovery data lambda', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should return the value of getRecoveryData ', async () => {
    const mockRecoveryData = createMock<WhoopCycle>()
    mockGetMostRecentCycle.mockReturnValue(mockRecoveryData)

    await handler(mockScheduledEvent, mockContext, mockCallback)

    expect(mockGetMostRecentCycle).toHaveBeenCalledTimes(1)
    expect(mockCallback).toBeCalledWith(null, { recoveryData: mockRecoveryData })
    expect(mockS3PutObject).toHaveBeenCalled()
  })

  it('should return an error instance of RecoveryDataException if there is any error', async () => {
    mockGetMostRecentCycle.mockImplementationOnce(() => {
      throw new Error('oof')
    })

    await handler(mockScheduledEvent, mockContext, mockCallback)
    expect(mockGetMostRecentCycle).toHaveBeenCalledTimes(1)
    expect(mockCallback).toBeCalledWith(new Error('oof'))
  })
})
