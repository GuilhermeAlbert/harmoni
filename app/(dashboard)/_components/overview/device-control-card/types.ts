import type { LucideIcon } from "lucide-react";

import type { DevicePickerOption } from "@/components/device-picker/types";

export interface DeviceControlCardProps {
  disabled: boolean;
  feedback: string;
  hint: string;
  icon: LucideIcon;
  label: string;
  onChange: (value: string) => void;
  options: readonly DevicePickerOption[];
  placeholder: string;
  value: string;
}
