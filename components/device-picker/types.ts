export interface DevicePickerOption {
  label: string;
  value: string;
}

export interface DevicePickerProps {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: readonly DevicePickerOption[];
  placeholder: string;
  value: string;
}
