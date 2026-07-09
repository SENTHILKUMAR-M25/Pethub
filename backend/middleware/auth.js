import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      req.user = await User.findById(req.session.userId).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      return next();
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  }

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    return next();
  } catch {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin access required" });
  }
};

export const optionalAuth = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      req.user = await User.findById(req.session.userId).select("-password");
    } catch {
      // ignore
    }
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const decoded = jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch {
      // ignore
    }
  }
  next();
};
