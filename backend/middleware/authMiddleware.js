import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "auth_token";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("JWT_SECRET must contain at least 32 bytes.");
  }

  return secret;
};

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Authentication required." });
  }
};
