import type { StateSelectorProps } from "./types";
import { OverviewFixtureState } from "@/lib/enums/overview-fixture-state";

const FIXTURE_STATES = [
  OverviewFixtureState.Success,
  OverviewFixtureState.Loading,
  OverviewFixtureState.Empty,
  OverviewFixtureState.Error,
] as const;

export function StateSelector({
  messages,
  onChange,
  value,
}: StateSelectorProps): React.ReactNode {
  return (
    <fieldset className="rounded-2xl border border-zinc-200 bg-zinc-100/70 p-3 dark:border-white/[0.08] dark:bg-white/[0.025]">
      <legend className="px-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
        {messages.fixtureStateLabel}
      </legend>
      <p className="px-1 pb-3 text-xs text-zinc-500">
        {messages.fixtureStateHint}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {FIXTURE_STATES.map((state) => {
          const selected = state === value;

          return (
            <button
              aria-pressed={selected}
              className={`min-h-9 rounded-xl px-3 text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-white ${selected ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950" : "bg-white text-zinc-600 hover:text-zinc-950 dark:bg-white/5 dark:text-zinc-400 dark:hover:text-white"}`}
              key={state}
              onClick={() => onChange(state)}
              type="button"
            >
              {messages.states[state]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
