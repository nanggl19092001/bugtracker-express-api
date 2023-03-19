const {OAuth2Client} = require('google-auth-library');

async function verifyOauthToken(clientId: Array<string> | string, token: string): Promise<any> {
    let client = new OAuth2Client(clientId)
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: clientId,
      });
      
      const payload = ticket.getPayload();
    
      return payload;
    } catch (error) {
      return error
    }
}

module.exports = verifyOauthToken