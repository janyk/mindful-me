import WhoopClient from './'

describe('WhoopClient', () => {
  let whoopClient: WhoopClient

  it('should throw an error if attempting to get cycles without logging in', async () => {
    expect.assertions(1)
    whoopClient = new WhoopClient()
    try {
      await whoopClient.getCycles()
    } catch (e) {
      expect(e.message).toEqual("No user id found, please make sure you've logged in")
    }
  })

  /* 
    requires a valid email and password for whoop to be added to .jest/setEnvVars.js 
    as this actually calls the whoop API
  */
  it('should get recovery data', async () => {
    expect.assertions(1)
    whoopClient = new WhoopClient()
    await whoopClient.login({ password: process.env.WHOOP_PASSWORD, email: process.env.WHOOP_EMAIL_ADDRESS })
    const data = await whoopClient.getCycles()
    expect(data).toBeTruthy()
  })
})
