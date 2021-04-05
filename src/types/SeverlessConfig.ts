import type { AWS } from '@serverless/typescript'
import StepFunctions from './StepFunctions'

export default interface SeverlessConfig extends AWS {
  app: string
  org: string
  stepFunctions: StepFunctions
}
