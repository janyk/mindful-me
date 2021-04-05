import { Context, Callback, ScheduledHandler } from 'aws-lambda'
import 'source-map-support/register'

export const handler: ScheduledHandler = async (event: any, _context: Context, callback: Callback): Promise<any> => {
  callback(null, { eventA: event.TransformOutput.S3OutputPath, contextA: _context })
}
