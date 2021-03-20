import got, { Response } from 'got'
import { formatToTimeZone } from 'date-fns-timezone'
import { AuthResult, WhoopCycle } from './types'

interface IWhoopCredentialsPayload {
  email: string
  password: string
}

// getting default query parameters based on my timezone... could extract this to lambda and provide an interface for it
const format = 'YYYY-MM-DDTHH:mm:ss.SSS'
const start = new Date()
start.setDate(start.getDate() - 1)
start.setHours(0, 0, 0, 1)
const localDefaultStartTime = formatToTimeZone(start, format, { timeZone: 'Pacific/Auckland' })

const end = new Date()
end.setDate(end.getDate() - 1)
end.setHours(23, 59, 59, 999)
const localDefaultEndTime = formatToTimeZone(end, format, { timeZone: 'Pacific/Auckland' })

export default class WhoopClient {
  authUrl: string = `oauth/token`
  userId: string | undefined
  default_params = {
    start: `${localDefaultStartTime}Z`,
    end: `${localDefaultEndTime}Z`,
  }

  api = got.extend({ prefixUrl: 'https://api-7.whoop.com/' })

  constructor() {}

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

  async login({ password, email }: IWhoopCredentialsPayload) {
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
