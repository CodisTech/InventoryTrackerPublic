import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import csrf from "csurf";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  // Debugging
  console.log(`[AUTH DEBUG] Comparing passwords`);
  console.log(`[AUTH DEBUG] Supplied length: ${supplied.length}, Stored length: ${stored.length}`);
  console.log(`[AUTH DEBUG] Stored contains period: ${stored.includes('.')}`);
  
  // Check if the stored password is using our scrypt format (contains a period separating hash and salt)
  if (stored.includes('.')) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    const result = timingSafeEqual(hashedBuf, suppliedBuf);
    console.log(`[AUTH DEBUG] Hashed password comparison result: ${result}`);
    return result;
  } 
  // For testing purposes, we also support plain text comparison for sample data
  // This should never be used in production
  else {
    const result = supplied === stored;
    console.log(`[AUTH DEBUG] Plain text comparison result: ${result}`);
    console.log(`[AUTH DEBUG] Supplied: ${supplied}, Stored: ${stored}`);
    return result;
  }
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "inventory-management-secret-key";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false, // Changed to false for performance - only save when modified
    saveUninitialized: false, // Changed to false for security - don't create unnecessary sessions
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      maxAge: 4 * 60 * 60 * 1000, // Reduced from 24 to 4 hours for security
      httpOnly: true, // Prevents client-side JS from reading the cookie
      sameSite: 'strict', // Stronger protection against CSRF
      path: '/', // Limit cookie to this path only
    }
  };
  
  console.log(`[AUTH DEBUG] Session store type: ${storage.sessionStore.constructor.name}`);
  console.log(`[AUTH DEBUG] Session secret: ${sessionSecret}`);
  console.log(`[AUTH DEBUG] Setting up session with settings: ${JSON.stringify({
    resave: sessionSettings.resave,
    saveUninitialized: sessionSettings.saveUninitialized,
    cookieSecure: sessionSettings.cookie?.secure,
    cookieMaxAge: sessionSettings.cookie?.maxAge
  })}`);

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Setup CSRF protection
  const csrfProtection = csrf({ cookie: false }); // Use session instead of cookies for CSRF

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      
      if (!user.isAuthorized) {
        return done(null, false, { message: "User is not authorized" });
      }
      
      try {
        if (await comparePasswords(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect username or password" });
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log(`[SERIALIZE DEBUG] Serializing user: ${JSON.stringify({ id: user.id, username: user.username })}`);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: unknown, done) => {
    try {
      console.log(`[DESERIALIZE DEBUG] Attempting to deserialize user ID: ${id}`);
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id as number;
      
      if (isNaN(numericId)) {
        console.log(`[DESERIALIZE DEBUG] Invalid user ID: ${id}`);
        return done(null, false);
      }
      
      const user = await storage.getUser(numericId);
      if (!user) {
        console.log(`[DESERIALIZE DEBUG] User not found for ID: ${numericId}`);
        return done(null, false);
      }
      
      if (!user.isAuthorized) {
        console.log(`[DESERIALIZE DEBUG] User found but not authorized: ${user.username}`);
        return done(null, false);
      }
      
      console.log(`[DESERIALIZE DEBUG] Successfully deserialized user: ${user.username}`);
      done(null, user);
    } catch (err: any) {
      console.log(`[DESERIALIZE DEBUG] Error deserializing user: ${err.message}`);
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't return the password hash to the client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log(`[LOGIN DEBUG] Login attempt with username: ${req.body.username}`);
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.log(`[LOGIN DEBUG] Login error: ${err.message}`);
        return next(err);
      }
      if (!user) {
        console.log(`[LOGIN DEBUG] Authentication failed: ${info?.message || "No user returned"}`);
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      console.log(`[LOGIN DEBUG] User authenticated successfully: ${user.username} (${user.id})`);
      
      req.login(user, (err) => {
        if (err) {
          console.log(`[LOGIN DEBUG] Session creation error: ${err.message}`);
          return next(err);
        }
        
        console.log(`[LOGIN DEBUG] Session created successfully, user logged in`);
        
        // Don't return the password hash to the client
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log(`[USER DEBUG] Session ID: ${req.sessionID || 'no session ID'}`);
    console.log(`[USER DEBUG] isAuthenticated: ${req.isAuthenticated()}`);
    console.log(`[USER DEBUG] req.user: ${req.user ? JSON.stringify(req.user) : 'undefined'}`);
    console.log(`[USER DEBUG] Session data: ${JSON.stringify(req.session || {})}`);
    
    if (!req.isAuthenticated()) {
      console.log(`[USER DEBUG] User not authenticated, returning 401`);
      return res.sendStatus(401);
    }
    
    console.log(`[USER DEBUG] User authenticated, returning user data`);
    // Don't return the password hash to the client
    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });

  // Middleware to check if the user is authenticated
  const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // CSRF token endpoint - only accessible to authenticated users
  app.get('/api/csrf-token', ensureAuthenticated, csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  return { ensureAuthenticated, csrfProtection };
}
