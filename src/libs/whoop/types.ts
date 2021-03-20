// types roughly taken from https://app.swaggerhub.com/apis/DovOps/whoop-unofficial-api/1.0.2#/metrics/get_users__userId__cycles

export interface AuthResult {
  access_token: string
  refresh_token: string
  expires_in: number
  membership_status: string
  needsProfileCompletion: string
  token_type: string
  user: User
}

export interface User {
  id: string
  avatarUrl?: string
  createdAt: Date
  updatedAt?: Date
  firstName?: string
  lastName?: string
}

export interface WhoopCycle {
  days?: string[] | null
  during: During
  id: number
  lastUpdatedAt: string
  predictedEnd: string
  recovery: Recovery
  sleep: Sleep
  strain: Strain
}

export interface During {
  bounds: string
  lower: string
  upper: string
}

export interface Recovery {
  blackoutUntil?: null
  calibrating: boolean
  heartRateVariabilityRmssd: number
  id: number
  responded: boolean
  restingHeartRate: number
  score: number
  state: string
  surveyResponseId?: null
  timestamp: string
}

export interface Sleep {
  id: number
  naps?: null[] | null
  needBreakdown: NeedBreakdown
  qualityDuration: number
  score: number
  sleeps?: SleepsEntity[] | null
  state: string
}

export interface NeedBreakdown {
  baseline: number
  debt: number
  naps: number
  strain: number
  total: number
}

export interface SleepsEntity {
  cyclesCount: number
  disturbanceCount: number
  during: During
  id: number
  inBedDuration: number
  isNap: boolean
  latencyDuration: number
  lightSleepDuration: number
  noDataDuration: number
  qualityDuration: number
  remSleepDuration: number
  respiratoryRate: number
  responded: boolean
  score: number
  sleepConsistency: number
  sleepEfficiency: number
  slowWaveSleepDuration: number
  source: string
  state: string
  surveyResponseId?: null
  timezoneOffset: string
  wakeDuration: number
}

export interface Strain {
  averageHeartRate: number
  kilojoules: number
  maxHeartRate: number
  rawScore: number
  score: number
  state: string
  workouts?: WorkoutsEntity[] | null
}

export interface WorkoutsEntity {
  altitudeChange?: null
  altitudeGain?: null
  averageHeartRate: number
  cumulativeWorkoutStrain: number
  distance?: null
  during: During
  gpsEnabled: boolean
  id: number
  kilojoules: number
  maxHeartRate: number
  rawScore: number
  responded: boolean
  score: number
  source: string
  sportId: number
  state: string
  surveyResponseId?: number | null
  timezoneOffset: string
  zones?: number[] | null
}
