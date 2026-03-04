import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import memorystore from "memorystore";
import { createGoogleStrategy } from "./strategies/google";
import { createLocalStrategy } from "./strategies/local";

const getSession = () => {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const connectionString = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    const MemoryStore = memorystore(session);
    return session({
      secret: process.env.SESSION_SECRET || "dev_secret_change_me",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000
      }),
      cookie: { secure: false }
    });
  }

  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: connectionString,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: sessionTtl,
    },
  });
};

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Register Google strategy if configured
  const googleStrategy = createGoogleStrategy();
  if (googleStrategy) {
    passport.use("google", googleStrategy);
  }

  // Register Local strategy
  passport.use("local", createLocalStrategy());
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Session expired or not logged in" });
};
