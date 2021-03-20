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
})
