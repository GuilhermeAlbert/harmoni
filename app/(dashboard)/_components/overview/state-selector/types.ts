import type { OverviewFixtureState } from "@/lib/enums/overview-fixture-state";
import type { Messages } from "@/lib/types/messages";

export interface StateSelectorProps {
  messages: Messages["overview"];
  onChange: (state: OverviewFixtureState) => void;
  value: OverviewFixtureState;
}
