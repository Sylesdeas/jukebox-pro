import express from "express";
const router = express.Router();
export default router;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, getUserByUsername } from "#db/queries/users";



router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res.status(400).send("Username and password required.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(username, hashedPassword);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.status(201).send(token);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res.status(400).send("Username and password required.");
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).send("Invalid username or password.");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).send("Invalid username or password.");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.send(token);
  } catch (err) {
    next(err);
  }
});

export default router;
