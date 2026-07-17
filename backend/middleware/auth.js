import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

// Verifies the Firebase ID token sent from the frontend and attaches
// the corresponding MongoDB user document to req.user
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      return res.status(401).json({ message: "User not found. Please register." });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: "Account has been suspended" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

// Used only by /api/auth/sync — verifies the Firebase token but does NOT
// require a Mongo user to already exist (since this route creates it).
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseDecoded = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      photoURL: decoded.picture,
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Firebase token" });
  }
};

// Restricts a route to one or more roles: authorize("owner", "admin")
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient permissions" });
  }
  next();
};
