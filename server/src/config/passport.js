import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import prisma from './database.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('No email from Google'), null);
    let user = await prisma.user.findFirst({ where: { OR: [{ providerId: profile.id, authProvider: 'google' }, { email }] } });
    if (!user) user = await prisma.user.create({ data: { name: profile.displayName || 'Google User', email, authProvider: 'google', providerId: profile.id, role: 'customer' } });
    return done(null, user);
  } catch (error) { return done(error, null); }
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID || 'placeholder',
  clientSecret: process.env.FACEBOOK_APP_SECRET || 'placeholder',
  callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    let user = await prisma.user.findFirst({ where: { OR: [{ providerId: profile.id, authProvider: 'facebook' }, ...(email ? [{ email }] : [])] } });
    if (!user) user = await prisma.user.create({ data: { name: profile.displayName || 'Facebook User', email: email || `fb_${profile.id}@noemail.com`, authProvider: 'facebook', providerId: profile.id, role: 'customer' } });
    return done(null, user);
  } catch (error) { return done(error, null); }
}));

export default passport;