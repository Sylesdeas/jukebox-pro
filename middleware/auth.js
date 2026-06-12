import jwt from "jsonwebtoken";
import { getUserById } from "#db/queries/users";

export async function requireUser(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).send("Unauthorized.");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(payload.id);

    if (!user) {
      return res.status(401).send("Unauthorized.");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("Unauthorized.");
  }
}
