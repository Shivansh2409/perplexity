import jsonwebtoken from "jsonwebtoken";
import { getUserById } from "../service/user.service.js";

export async function authenticateUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "no token found" });
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "invalid token" });
    }
    const user = await getUserById(decoded.id);
    if (!user.success) {
      return res.status(401).json({ message: "user not found" });
    }
    req.user = user.user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "invalid token" });
  }
}
