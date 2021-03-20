import getRecoveryData from '@functions/get-recovery-data'
import SeverlessConfigType from 'src/types/SeverlessConfigType'

const serverlessConfiguration: SeverlessConfigType = {
  org: '${env:ORG}',
  app: '${env:APP}',
  service: '${env:SERVICE}',
  useDotenv: true,
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack', 'serverless-step-functions'],
  provider: {
    name: 'aws',
    // region doesn't play nicely with environment variables..
    // could utilise a deep omit helper instead of this nasty casting..
    // just picking a random region from https://github.com/serverless/typescript/blob/master/index.d.ts#L853
    region: '${env:REGION}' as 'ap-southeast-2',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: { getRecoveryData },
  stepFunctions: {
    stateMachines: {
      ['mindful-me-calorie-inference']: {
        name: 'MindfulMeCaloriePrediction',
        definition: {
          StartAt: 'getRecoveryData',
          States: {
            ['getRecoveryData']: {
              Type: 'Task',
              End: true,
              Resource: { 'Fn::GetAtt': ['getRecoveryData', 'Arn'] },
              Catch: [{ ErrorEquals: ['RecoveryDataException'], Next: 'CustomErrorCatcher' }],
            },
            ['CustomErrorCatcher']: {
              Type: 'Pass',
              End: true,
            },
          },
        },
      },
    },
  },
}

module.exports = serverlessConfiguration
