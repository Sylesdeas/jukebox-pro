import express from "express";
const router = express.Router();
export default router;

import {
  createPlaylist,
  getPlaylistById,
  getPlaylistsByUserId,
} from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { getTracksByPlaylistId } from "#db/queries/tracks";
import { requireUser } from "./middleware/auth.js";

router.use(requireUser);

router.get("/", async (req, res, next) => {
  try {
    const playlists = await getPlaylistsByUserId(req.user.id);
    res.send(playlists);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body ?? {};

    if (!name || !description) {
      return res.status(400).send("Name and description required.");
    }

    const playlist = await createPlaylist(name, description, req.user.id);

    res.status(201).send(playlist);
  } catch (err) {
    next(err);
  }
});

async function requirePlaylistOwner(req, res, next) {
  try {
    const playlist = await getPlaylistById(req.params.id);

    if (!playlist) {
      return res.status(404).send("Playlist not found.");
    }

    if (playlist.user_id !== req.user.id) {
      return res.status(403).send("Forbidden.");
    }

    req.playlist = playlist;
    next();
  } catch (err) {
    next(err);
  }
}
router.get("/:id", requirePlaylistOwner, async (req, res) => {
  res.send(req.playlist);
});

router.param("id", async (req, res, next, id) => {
  const playlist = await getPlaylistById(id);
  if (!playlist) return res.status(404).send("Playlist not found.");

  req.playlist = playlist;
  next();
});

router.get("/:id", (req, res) => {
  res.send(req.playlist);
});

router.get("/:id/tracks", requirePlaylistOwner, async (req, res, next) => {
  try {
    const tracks = await getTracksByPlaylistId(req.params.id);
    res.send(tracks);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/tracks", requirePlaylistOwner, async (req, res) => {
  if (!req.body) return res.status(400).send("Request body is required.");

  const { trackId } = req.body;
  if (!trackId) return res.status(400).send("Request body requires: trackId");

  const playlistTrack = await createPlaylistTrack(req.playlist.id, trackId);
  res.status(201).send(playlistTrack);
});
