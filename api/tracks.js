import express from "express";
const router = express.Router();
export default router;

import { requireUser } from "./middleware/auth.js";
import { getTracks, getTrackById } from "#db/queries/tracks";
import { getUserPlaylistsByTrackId } from "#db/queries/playlists";

router.get("/", async (req, res) => {
  const tracks = await getTracks();
  res.send(tracks);
});

router.get("/:id/playlists", requireUser, async (req, res, next) => {
  try {
    const track = await getTrackById(req.params.id);

    if (!track) {
      return res.status(404).send("Track not found.");
    }

    const playlists = await getUserPlaylistsByTrackId(
      req.params.id,
      req.user.id
    );

    res.send(playlists);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res) => {
  const track = await getTrackById(req.params.id);
  if (!track) return res.status(404).send("Track not found.");
  res.send(track);
});
