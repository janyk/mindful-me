// serverless-step-functions doesn't have a definition file unfortunately
// defining our own, courtesy of:
// https://github.com/serverless-operations/serverless-step-functions/issues/370

type Definition = {
  Comment?: string
  StartAt: string
  States: {
    [state: string]: {
      Catch?: Catcher[]
      Type: 'Map' | 'Task' | 'Choice' | 'Pass'
      End?: boolean
      Next?: string
      ItemsPath?: string
      ResultPath?: string
      Resource?: string | { 'Fn::GetAtt': string[] }
      Iterator?: Definition
    }
  }
}

type Catcher = {
  ErrorEquals: ErrorName[]
  Next: string
  ResultPath?: string
}

type ErrorName =
  | 'States.ALL'
  | 'States.DataLimitExceeded'
  | 'States.Runtime'
  | 'States.Timeout'
  | 'States.TaskFailed'
  | 'States.Permissions'
  | string

  export default interface StepFunctions {
    stateMachines: {
        [stateMachine: string]: {
          name: string
          definition: Definition
        }
      }
      activities?: string[]
      validate?: boolean
  }
