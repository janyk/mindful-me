import { Context, Callback, ScheduledEvent, ScheduledHandler } from 'aws-lambda'
import WhoopClient from '@libs/whoop'
import { WhoopCycle } from '@libs/whoop/types'
import RecoveryDataException from '@errors/RecoveryDataException'
import 'source-map-support/register'

const email = process.env.WHOOP_EMAIL_ADDRESS
const password = process.env.WHOOP_EMAIL_PASSWORD
export const RECOVERY_FETCH_EXCEPTION_MESSAGE = 'Unable to find recovery data'

export const handler: ScheduledHandler = async (
  _event: ScheduledEvent,
  _context: Context,
  callback: Callback,
): Promise<any> => {
  try {
    const recoveryData = await getRecoveryData()
    callback(null, { recoveryData })
  } catch (e) {
    callback(new RecoveryDataException(RECOVERY_FETCH_EXCEPTION_MESSAGE))
  }
}

export const getRecoveryData = async (): Promise<WhoopCycle> => {
  const client = new WhoopClient()

  await client.login({ email, password })

  return client.getMostRecentCycle()
}
