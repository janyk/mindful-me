import { Context, Callback, ScheduledEvent } from 'aws-lambda'
import RecoveryDataException from '@errors/RecoveryDataException'
import { getRecoveryData, handler, RECOVERY_FETCH_EXCEPTION_MESSAGE } from '@functions/get-recovery-data/handler'

// kind of filthy, but non of these arguments properties are being used so no need to mock them
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

describe('getRecoveryData', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should return the value of getRecoveryData ', async () => {
    mockGetMostRecentCycle.mockReturnValue(42)
    await getRecoveryData()

    expect(mockGetMostRecentCycle).toHaveBeenCalledWith(42)
    expect(mockGetMostRecentCycle).toHaveBeenCalledTimes(1)
  })

  it('should return an error instance of RecoveryDataException if there is any error', async () => {
    mockGetMostRecentCycle.mockImplementationOnce(() => {
      throw new Error('oof')
    })

    await handler(mockScheduledEvent, mockContext, mockCallback)
    expect(mockGetMostRecentCycle).toHaveBeenCalledTimes(1)
    expect(mockCallback).toBeCalledWith(new RecoveryDataException(RECOVERY_FETCH_EXCEPTION_MESSAGE))
  })
})
