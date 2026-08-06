export default function Home(): React.ReactNode {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-6 text-zinc-100">
      <section className="max-w-xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          macOS device control
        </p>

        <h1 className="mt-4 text-5xl font-semibold tracking-tight">Harmoni</h1>

        <p className="mt-4 text-balance text-sm leading-6 text-zinc-400">
          One place for your Mac&apos;s audio, cameras, peripherals, and setup
          profiles.
        </p>
      </section>
    </main>
  );
}
