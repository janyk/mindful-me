import SageMakerTransformJob from '@custom-types/SageMakerTransformJob'
import { Context, Callback, Handler } from 'aws-lambda'
import 'source-map-support/register'

export const handler: Handler<SageMakerTransformJob> = async (event, _context: Context, callback: Callback): Promise<void> => {
  callback(null, { eventA: event.TransformOutput.S3OutputPath, contextA: _context })
}
