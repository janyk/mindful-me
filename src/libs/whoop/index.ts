import got, { Response } from 'got'
import { formatToTimeZone } from 'date-fns-timezone'
import { AuthResult, WhoopCycle } from './types'

interface IWhoopCredentialsPayload {
  email: string
  password: string
}

const tz = process.env.TIMEZONE || 'Pacific/Auckland'

// default query parameters for today - defaults to NZ timezone
const format = 'YYYY-MM-DDTHH:mm:ss.SSS'
const start = new Date()
start.setUTCHours(1, 0, 0, 0)
const localDefaultStartTime = formatToTimeZone(start, format, { timeZone: tz })

const end = new Date()
end.setUTCHours(23, 59, 59, 1)
const localDefaultEndTime = formatToTimeZone(end, format, { timeZone: tz })

export default class WhoopClient {
  authUrl = `oauth/token`
  userId: string | undefined
  default_params = {
    start: `${localDefaultStartTime}Z`,
    end: `${localDefaultEndTime}Z`,
  }

  api = got.extend({ prefixUrl: 'https://api-7.whoop.com/' })

  async getCycles(query = this.default_params): Promise<WhoopCycle[]> {
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
    // big assumption about Whoop API made here.. should probably sort the cycles by day attribute
    const [latestCycle] = await this.getCycles()

    if (!latestCycle) {
      throw new Error('No cycle found for yesterday.')
    }

    return latestCycle
  }

  async login({ password, email }: IWhoopCredentialsPayload): Promise<void> {
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
