import { S3Event, S3Handler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import 'source-map-support/register'

const CALORIE_LIMIT = Number(process.env.CALORIE_LIMIT) || 10000
const NOTIFICATION_ADDRESS = process.env.NOTIFICATION_ADDRESS

// TODO: handle failures gracefully, maybe use something like styled-components to create a richer email and add tests

/* This lamda processes results in our "datalake" - it is configured to be triggered on write to our processed directory
 * 1. Recieve s3 event
 * 2. Grab Kilojoule result from s3 and convert to Kilocal
 * 3. If prediction is higher than users desired calorie limit or 10000, email the notification address with a heads up and tip ✌
 */
export const handler: S3Handler = async (event: S3Event): Promise<any> => {
  const s3 = new AWS.S3()
  const ses = new AWS.SES()

  const {
    s3: {
      bucket: { name: Bucket },
      object: { key },
    },
  } = event.Records[0]
  const Key = decodeURIComponent(key)
  const { Body } = await s3.getObject({ Bucket, Key }).promise()
  // predication model outputs in kj - convert to kilocalories
  const caloriePrediction = Math.floor(Number(Body.toString('utf-8')) / 4.184)

  if (caloriePrediction > CALORIE_LIMIT) {
    const params: AWS.SES.SendEmailRequest = {
      Destination: {
        ToAddresses: [NOTIFICATION_ADDRESS],
      },
      Message: {
        Body: {
          Text: {
            Data: `We've predicted your calorie intake today to be ${caloriePrediction} - which is higher than your desired intake of ${CALORIE_LIMIT}. Here's a tip on how to control your intake..
            
${tips[Math.floor(Math.random() * tips.length)]}
            
Have a great day!
            `,
          },
        },

        Subject: { Data: 'Hey! Just a heads up..' },
      },
      Source: NOTIFICATION_ADDRESS,
    }

    return ses.sendEmail(params).promise()
  }
}

const tips = [
  'Try to consume healthy fats, like avocado or almonds before or as part of your meal',
  "Ensure you're eating meals complete with protien and fats, this will help you feel full and avoid binging on carbs",
  'Try having a shot of white vinegar before your meal, this will help improve satiety as well as have the effect of delaying gastric emptying',
]
