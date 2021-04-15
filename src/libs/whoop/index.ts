import got, { Response } from 'got'
import { clock, sortByDateAttr } from '@utils/dates'
import { AuthResult, WhoopCycle } from './types'

const tz = process.env.TIMEZONE || 'Pacific/Auckland'

type WhoopCredentialsPayload = {
  email: string
  password: string
}

type CyclesQuery = {
  start: string
  end: string
}

export default class WhoopClient {
  authUrl = `oauth/token`
  userId: string | undefined

  api = got.extend({ prefixUrl: 'https://api-7.whoop.com/' })

  /* Gets cycles for a given time period
   * @param {string} start - start of date range to query whoop for cycles in ISO Format
   * @param {string} end - end of date range to query whoop for cycles in ISO Format
   */
  async getCycles(query: CyclesQuery): Promise<WhoopCycle[]> {
    if (!this.userId) throw new Error("No user id found, please make sure you've logged in")

    const { statusCode, body: cycles } = ((await this.api(`users/${this.userId}/cycles`, {
      searchParams: query,
      responseType: 'json',
    })) as unknown) as Response<WhoopCycle[]>

    if (statusCode !== 200) {
      throw new Error('Unable to fetch cycles from Whoop API')
    }

    return cycles
  }

  async getMostRecentCycle(): Promise<WhoopCycle> {
    const start = clock.mostRecentMidnight(tz).toISOString()
    const end = clock.nextMidnight(tz).toISOString()

    const cycles = await this.getCycles({ start, end })

    // kind of fumbling in the dark since theres no documentation on whoops response payload...
    // but if upper bound is null, then it doesn't exist and assuming is therefore the current cycle(?)
    // else sort cycles by their predicted end..
    let latestCycle = cycles.find((cycle) => cycle.during.upper === null)
    latestCycle = latestCycle ?? sortByDateAttr<WhoopCycle>(cycles, 'predictedEnd')[0]

    if (!latestCycle) {
      // sort of aggressive to throw an error if none found
      // but my assumption is there is always one for the past few days
      throw new Error(`No cycle found for ${start} through to ${end}`)
    }

    return latestCycle
  }

  async login({ password, email }: WhoopCredentialsPayload): Promise<void> {
    const response = await this.api.post(this.authUrl, {
      json: {
        grant_type: 'password',
        issueRefresh: false,
        password: password,
        username: email,
      },
      responseType: 'json',
    })

    const { statusCode, body } = response
    const {
      access_token,
      user: { id },
    } = body as AuthResult

    if (statusCode !== 200) {
      throw new Error('Credentials rejected')
    }

    this.userId = id

    this.api = this.api.extend({
      headers: { Authorization: `bearer ${access_token}` },
    })
  }
}
