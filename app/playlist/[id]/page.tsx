import PlaylistClient from "./PlaylistClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPlaylistTracks } from "@/app/actions/spotify";

export default async function PlaylistPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <p>You must be signed in to view this playlist.</p>;
  }

  const tracks = await getPlaylistTracks(id);
  console.log("Tracks:", tracks); // or JSON.stringify(tracks, null, 2)

  return <PlaylistClient id={id} tracks={tracks} />;
}
