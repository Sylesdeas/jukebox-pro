import db from "#db/client";
import bcrypt from "bcrypt";

import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";
import { createUser } from "#db/queries/users";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const alice = await createUser("alice", hashedPassword);
  const bob = await createUser("bob", hashedPassword);

  for (let i = 1; i <= 20; i++) {
    await createTrack("Track " + i, i * 50000);
  }

  const alicePlaylist = await createPlaylist(
    "Alice's Playlist",
    "Alice's favorite tracks",
    alice.id,
  );
  const bobPlaylist = await createPlaylist(
    "Bob's Playlist",
    "Bob's favorite tracks",
    bob.id,
  );

  for (let trackId = 1; trackId <= 5; trackId++) {
    await createPlaylistTrack(alicePlaylist.id, trackId);
  }

  for (let trackId = 6; trackId <= 10; trackId++) {
    await createPlaylistTrack(bobPlaylist.id, trackId);
  }
}
