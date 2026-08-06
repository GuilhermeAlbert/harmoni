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
  navigation: {
    mainLabel: "Navegação principal",
    workspace: "Área de trabalho",
    openMenu: "Abrir navegação",
    closeMenu: "Fechar navegação",
  },
  routes: {
    overview: {
      label: "Visão geral",
      subtitle: "Sua configuração ativa em resumo.",
    },
    audio: {
      label: "Áudio",
      subtitle: "Microfones, saídas, volume e mudo.",
    },
    cameras: {
      label: "Câmeras",
      subtitle: "Câmera preferida e controles compatíveis.",
    },
    peripherals: {
      label: "Periféricos",
      subtitle: "Teclados, mouses e dispositivos conectados.",
    },
    profiles: {
      label: "Perfis",
      subtitle: "Alterne configurações completas com consistência.",
    },
    settings: {
      label: "Configurações",
      subtitle: "Permissões e comportamento do aplicativo.",
    },
  },
  routePlaceholder: {
    eyebrow: "Área de trabalho",
    description:
      "Esta rota está pronta para sua especificação de produto dedicada.",
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
