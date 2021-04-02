import type { AWS } from '@serverless/typescript'
import StepFunctions from './StepFunctions';

export default interface CustomAWSConfig extends AWS {
  app: string
  org: string
  stepFunctions: StepFunctions
}
