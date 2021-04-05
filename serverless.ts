import SeverlessConfig from '@custom-types/SeverlessConfig'
import getRecoveryData from '@functions/get-recovery-data'
import logResult from '@functions/log-result'
import startInferenceStateMachine from '@functions/start-inference-state-machine'

const serverlessConfiguration: SeverlessConfig = {
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
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['states:StartExecution'],
        Resource: ['*'],
      },
      {
        Effect: 'Allow',
        Action: ['s3:putObject'],
        Resource: ['*'],
      },
    ],
    lambdaHashingVersion: '20201221',
  },
  resources: {
    Outputs: {
      InferenceStateMachine: {
        Value: {
          Ref: 'MindfulMeCaloriePrediction',
        },
      },
    },
  },
  // import the function via paths
  functions: { getRecoveryData, logResult, startInferenceStateMachine },
  stepFunctions: {
    stateMachines: {
      GetRecoveryData: {
        name: 'GetRecoveryData',
        events: [
          {
            schedule: 'cron(30 19 * * ? *)',
          },
        ],
        definition: {
          StartAt: 'GetRecoveryData',
          States: {
            GetRecoveryData: {
              Type: 'Task',
              End: true,
              Resource: { 'Fn::GetAtt': ['getRecoveryData', 'Arn'] },
              Catch: [{ ErrorEquals: ['RecoveryDataException'], Next: 'CustomErrorCatcher' }],
            },
            CustomErrorCatcher: {
              Type: 'Pass',
              End: true,
            },
          },
        },
      },
      MindfulMeCaloriePrediction: {
        name: 'MindfulMeCaloriePrediction',
        definition: {
          StartAt: 'StartBatchJob',
          States: {
            StartBatchJob: {
              Type: 'Task',
              Resource: 'arn:aws:states:::sagemaker:createTransformJob.sync',
              Parameters: {
                ModelName: '${env:MODEL_NAME}',
                TransformInput: {
                  CompressionType: 'None',
                  ContentType: 'text/csv',
                  DataSource: {
                    S3DataSource: {
                      S3DataType: 'S3Prefix',
                      'S3Uri.$': '$.input_file_path',
                    },
                  },
                },
                TransformOutput: {
                  'S3OutputPath.$': '$.output_file_path',
                },
                TransformResources: {
                  InstanceCount: 1,
                  InstanceType: 'ml.m4.xlarge',
                },
                'TransformJobName.$': '$.job_name',
              },
              Next: 'Loggit',
            },
            Loggit: {
              Type: 'Task',
              End: true,
              Resource: { 'Fn::GetAtt': ['logResult', 'Arn'] },
              Catch: [{ ErrorEquals: ['RecoveryDataException'], Next: 'CustomErrorCatcher' }],
            },
            CustomErrorCatcher: {
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
