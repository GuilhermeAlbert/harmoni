import type { EN_MESSAGES } from "@/lib/i18n/messages/en";

type WidenMessageValues<Value> = Value extends string
  ? string
  : {
      [Key in keyof Value]: WidenMessageValues<Value[Key]>;
    };

export type Messages = WidenMessageValues<typeof EN_MESSAGES>;

