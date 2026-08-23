import { OAuth2Client } from 'google-auth-library';
import { getUser } from './firestore.js';
import { decrypt } from './crypto.js';

export function buildOAuth2Client() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export async function getAuthedClient(userId) {
  const user = await getUser(userId);
  if (!user || !user.refreshTokenEnc) {
    throw new Error('User not found or no refresh token');
  }
  
  let refreshToken;
  try {
    refreshToken = decrypt(user.refreshTokenEnc);
  } catch (err) {
    throw new Error('Failed to decrypt refresh token');
  }
  
  const client = buildOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });
  
  return client;
}

export function getAuthUrl(promptConsent = true) {
  const client = buildOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: promptConsent ? 'consent' : undefined
  });
}

export async function exchangeCodeForTokens(code) {
  const client = buildOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function getUserInfo(accessToken) {
  const client = buildOAuth2Client();
  client.setCredentials({ access_token: accessToken });
  const { data } = await client.request({
    url: 'https://www.googleapis.com/oauth2/v2/userinfo'
  });
  return data;
}