import type { Messages } from "@/lib/types/messages";

export const PT_BR_MESSAGES = {
  metadata: {
    title: "Harmoni",
    description:
      "Gerenciamento centralizado de dispositivos e periféricos para macOS.",
  },
  brand: {
    imageAlt: "Harmoni",
    subtitle: "Controle de periféricos",
  },
  language: {
    label: "Idioma",
  },
  theme: {
    label: "Aparência",
    light: "Claro",
    dark: "Escuro",
    system: "Sistema",
  },
  preview: {
    eyebrow: "Base do design",
    title: "Controles precisos para cada dispositivo.",
    description:
      "Uma base discreta e acessível para a interface de gerenciamento de dispositivos do Harmoni.",
    controlsTitle: "Controles",
    controlsDescription: "Estados completos de interação com densidade compacta.",
    enabled: "Ativado",
    disabled: "Desativado",
    inputVolume: "Volume de entrada",
    monitoringTitle: "Monitoramento de dispositivos",
    monitoringDescription: "Receba alterações de conexão e estado.",
    primaryAction: "Ação principal",
    secondaryAction: "Secundária",
    applying: "Aplicando",
    working: "Processando",
    refreshDevices: "Atualizar dispositivos",
    deviceStatesTitle: "Estados dos dispositivos",
    deviceStatesDescription:
      "O feedback semântico nunca depende apenas de cor.",
    discoveringDevices: "Procurando dispositivos",
    noDevicesTitle: "Nenhum dispositivo ainda",
    noDevicesDescription:
      "Os dispositivos conectados aparecerão aqui quando a descoberta estiver disponível.",
    checkAgain: "Verificar novamente",
  },
} satisfies Messages;

