import { getUser } from "../lib/firestore.js";

export async function requireAuth(req, res, next) {
  try {
    const uid = req.session?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await getUser(uid);
    if (!user) {
      req.session = null;
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
