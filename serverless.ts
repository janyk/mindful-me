import SeverlessConfig, { Region } from '@custom-types/SeverlessConfig'
import getRecoveryData from '@functions/get-recovery-data'
import logResult from '@functions/log-result'
import startInferenceStateMachine from '@functions/start-inference-state-machine'
import processPredictionResult from '@functions/process-prediction-result'

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
    /* Not a big fan of casting,
     * but environment variables come as
     * strings so need to cast to play nice, or relax the type on ServerlessConfig
     */
    region: '${env:REGION}' as Region,
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    // TODO: move statements to lambdas, instead globally applied..
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['states:StartExecution'],
        Resource: ['*'],
      },
      {
        Effect: 'Allow',
        Action: ['s3:putObject', 's3:getObject'],
        // TODO: scope down to datalake bucket
        Resource: ['*'],
      },
      {
        Effect: 'Allow',
        Action: ['ses:SendEmail', 'ses:SendRawEmail'],
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
  functions: { getRecoveryData, logResult, startInferenceStateMachine, processPredictionResult },
  // TODO: configure graceful error handling (exponential backoff or other means) for state machines
  stepFunctions: {
    stateMachines: {
      GetRecoveryData: {
        name: 'GetRecoveryData',
        events: [
          {
            schedule: 'cron(00 21 * * ? *)',
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
