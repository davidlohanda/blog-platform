import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './index';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export function configurePassport(): void {
  if (!config.google.clientId || !config.google.clientSecret) {
    console.warn(
      '[Passport] Google OAuth not configured — GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing',
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
      },
      (_accessToken, _refreshToken, profile, done) => {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Google account has no email address'));
        }

        const googleUser: GoogleProfile = {
          googleId: profile.id,
          email,
          name: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value,
        };

        return done(null, googleUser);
      },
    ),
  );
}
