export default function HelpPage() {
  return (
    <div className="relative flex h-screen flex-col items-center overflow-y-auto px-6 pt-16">
      <div className="w-full max-w-3xl space-y-8">
        <h1 className="font-corben text-center text-3xl font-bold">Help & FAQ</h1>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What does Hueify do?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Hueify lets you sort your Spotify playlists by the{' '}
            <span className="font-medium">dominant colors </span>
            of their tracks&apos; album artwork and sorts them using the LCH hue color wheel
            (0-360).
          </p>
        </section>

        {/* <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            Why do I need to give Hueify access to my Spotify account?
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Hueify uses the <span className="font-medium">Spotify Web API </span> and requires you
            to authorise the app with your Spotify account in order to save your newly sorted
            playlists.
          </p>
        </section> */}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How do I use it?</h2>
          <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              Copy the link of the playlist you want to sort. (Three dots &gt; Share &gt; Copy link
              to playlist)
            </li>
            <li>Paste it in the input element on the homepage.</li>
            <li>Fine-tune your playlist by selecting the best color option for each track.</li>
            <li>
              Save your newly sorted playlist through Hueify, then add it to your own Spotify
              library.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Why can&apos;t I sign in?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Hueify is currently in developer mode with limited access while in testing. If
            you&apos;d like to try it, please reach out!
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Need more help or have any feedback?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            You can reach me at{' '}
            <a
              href="mailto:luke@sukelully.dev"
              className="text-blue-600 underline dark:text-blue-400"
            >
              luke@sukelully.dev
            </a>
            &nbsp;and I&apos;ll get back to you!
          </p>
        </section>
      </div>
    </div>
  );
}
