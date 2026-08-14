import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { Spinner } from "@/components/spinner";
import { SpinnerSize } from "@/components/spinner/enums";
import { PermissionStatus } from "@/lib/enums/permission-status";
import {
  PERMISSION_CATEGORY_MESSAGE_KEYS,
  PERMISSION_ICONS,
  PERMISSION_STATUS_MESSAGE_KEYS,
  PERMISSION_STATUS_TONES,
} from "../constants";
import type { PermissionRowProps } from "./types";

export function PermissionRow({
  messages,
  onReview,
  permission,
  reviewingCategory,
}: PermissionRowProps): React.ReactNode {
  const Icon = PERMISSION_ICONS[permission.category];
  const reviewing = reviewingCategory === permission.category;
  const labelId = `permission-${permission.category}`;

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="truncate text-sm font-medium" id={labelId}>
          {messages.categories[PERMISSION_CATEGORY_MESSAGE_KEYS[permission.category]]}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge tone={PERMISSION_STATUS_TONES[permission.status]}>
          {messages.statuses[PERMISSION_STATUS_MESSAGE_KEYS[permission.status]]}
        </Badge>
        <Button
          aria-describedby={labelId}
          disabled={permission.status === PermissionStatus.Unsupported || reviewingCategory !== null}
          onClick={() => void onReview(permission.category)}
          size={ButtonSize.Small}
          variant={ButtonVariant.Ghost}
        >
          {reviewing ? <Spinner label={messages.openingSettings} size={SpinnerSize.Small} /> : null}
          {reviewing ? messages.openingSettings : messages.reviewPermission}
        </Button>
      </div>
    </li>
  );
}
