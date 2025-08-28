'use client';

type PlaylistClientProps = {
  id: string;
  tracks: any[];
};

export default function PlaylistClient({ id, tracks }: PlaylistClientProps) {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1>No tracks found in this playlist.</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">{id}</h1>
      <ul className="flex flex-col gap-2">
        {tracks.map((track: any, index: number) => (
          <li key={index}>
            {track.track?.name} — {track.track?.artists.map((a: any) => a.name).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
