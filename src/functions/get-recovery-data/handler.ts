import { Context, Callback, ScheduledEvent, ScheduledHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { formatToTimeZone } from 'date-fns-timezone'
import WhoopClient from '@libs/whoop'
import { WhoopCycle } from '@libs/whoop/types'
import 'source-map-support/register'

const email = process.env.WHOOP_EMAIL_ADDRESS
const password = process.env.WHOOP_EMAIL_PASSWORD
const Bucket = process.env.DATA_LAKE_BUCKET

export const handler: ScheduledHandler = async (
  _event: ScheduledEvent,
  _context: Context,
  callback: Callback,
): Promise<any> => {
  try {
    const s3 = new AWS.S3()
    const recoveryData = await getRecoveryData()
    const recoveryDataTabular = getTabularRecoveryData(recoveryData)

    await s3
      .putObject({
        Bucket,
        Key: getFileKey(),
        Body: recoveryDataTabular,
        ContentType: 'text/csv',
      })
      .promise()

    callback(null, { recoveryData })
  } catch (e) {
    // TODO: handle this for a few different scenarios
    // gracefully if whoop service is giving 4xx or 5xx
    // if S3 putObject is having woes then give hints to remedy to consumer who's using the setup
    callback(e)
  }
}

export const getRecoveryData = async (): Promise<WhoopCycle> => {
  const client = new WhoopClient()

  await client.login({ email, password })

  return client.getMostRecentCycle()
}

/* 
  TODO: provide documentation about what the model provided by consumer is going to be provided with
  rMSSD,resting_hr,recovery_score,n_naps,sleep_need_baseline,sleep_debt,sleep_need_strain,sleep_need_total,sleep_quality_duration,avg_hr,max_hr
*/
export const getTabularRecoveryData = ({
  recovery: { heartRateVariabilityRmssd, restingHeartRate, score },
  sleep: {
    naps,
    needBreakdown: { baseline, debt, strain, total },
    qualityDuration,
  },
  strain: { maxHeartRate, averageHeartRate },
}: WhoopCycle): string => {
  return `${heartRateVariabilityRmssd},${restingHeartRate},${score},${naps},${baseline},${debt},${strain},${total},${qualityDuration},${averageHeartRate},${maxHeartRate}`
}

export const getFileKey = (): string => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 1)
  startDate.setHours(0, 0, 0, 1)
  return `raw/${formatToTimeZone(startDate, 'YYYY-MM-DDTHH:mm:ss.SSS', { timeZone: 'Pacific/Auckland' })}.csv`
}
