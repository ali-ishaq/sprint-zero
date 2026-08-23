import { Router } from 'express';
import { getAuthUrl, exchangeCodeForTokens, getUserInfo, buildOAuth2Client } from '../lib/googleAuth.js';
import { upsertUser } from '../lib/firestore.js';
import { encrypt } from '../lib/crypto.js';

const router = Router();

router.get('/login', (req, res) => {
  const promptConsent = req.query.prompt !== 'false';
  const url = getAuthUrl(promptConsent);
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.redirect('/?error=access_denied');
  }
  
  if (!code) {
    return res.redirect('/?error=no_code');
  }
  
  try {
    const tokens = await exchangeCodeForTokens(code);
    
    if (!tokens.refresh_token) {
      return res.redirect('/?error=no_refresh_token&message=Please re-authenticate with consent');
    }
    
    const userInfo = await getUserInfo(tokens.access_token);
    const uid = userInfo.email;
    
    const refreshTokenEnc = encrypt(tokens.refresh_token);
    
    await upsertUser(uid, {
      email: userInfo.email,
      displayName: userInfo.name || userInfo.email,
      refreshTokenEnc
    });
    
    req.session.uid = uid;
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Auth callback error:', err);
    if (err.message.includes('invalid_grant')) {
      return res.redirect('/?error=invalid_grant&message=Please sign in again');
    }
    res.redirect('/?error=callback_failed');
  }
});

router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ success: true });
});

router.get('/me', async (req, res) => {
  if (!req.session?.uid) {
    return res.status(401).json({ authenticated: false });
  }
  
  const user = await getUser(req.session.uid);
  if (!user) {
    req.session = null;
    return res.status(401).json({ authenticated: false });
  }
  
  res.json({ authenticated: true, user: { email: user.email, displayName: user.displayName } });
});

export default router;