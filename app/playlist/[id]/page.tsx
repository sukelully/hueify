import PlaylistClient from "./PlaylistClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPlaylistTracks } from "@/app/actions/spotifyClient";
import SignInScreen from "@/app/components/misc/SignInScreen";

export default async function PlaylistPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return <SignInScreen />
  
  const tracks = await getPlaylistTracks(id);
  console.log("Tracks:", tracks); // or JSON.stringify(tracks, null, 2)

  return <PlaylistClient id={id} tracks={tracks} />;
}
