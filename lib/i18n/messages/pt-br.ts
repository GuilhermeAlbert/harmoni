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
  overview: {
    fixtureLabel: "Dados simulados de fixture",
    eyebrow: "Visão geral do sistema",
    title: "Tudo conectado. Nada fora de sintonia.",
    description:
      "Revise dispositivos ativos, experimente rotinas comuns e inspecione todos os estados da interface antes da conexão com a descoberta nativa.",
    privacyMode: "Modo de privacidade",
    applyWorkProfile: "Aplicar perfil Trabalho",
    refresh: "Atualizar dispositivos",
    refreshing: "Atualizando dispositivos",
    fixtureStateLabel: "Estado da fixture",
    fixtureStateHint: "Escolha um estado para visualizar esta rota.",
    states: {
      success: "Sucesso",
      loading: "Carregando",
      empty: "Vazio",
      error: "Erro",
    },
    metrics: {
      audioInput: "Entrada de áudio",
      audioOutput: "Saída de áudio",
      camera: "Câmera",
      peripherals: "Periféricos",
      connected: "conectados",
      noActiveDevice: "Nenhum dispositivo ativo",
      allResponding: "Todos os dispositivos compatíveis respondendo",
      volume: "de volume",
      muted: "Mudo",
      unmuted: "Com som",
      zoom: "de zoom",
    },
    devices: {
      title: "Dispositivos conectados",
      description: "Ative ou desative dispositivos compatíveis da fixture.",
      viewAll: "Ver todos",
      status: {
        active: "Ativo",
        connected: "Conectado",
        disconnected: "Desconectado",
        unsupported: "Controle não compatível",
        unavailable: "Indisponível",
      },
      categories: {
        audioInput: "Microfone",
        audioOutput: "Saída de áudio",
        camera: "Câmera",
        keyboard: "Teclado",
        mouse: "Mouse",
        trackpad: "Trackpad",
      },
      battery: "de bateria",
      enable: "Ativar dispositivo",
      disable: "Desativar dispositivo",
    },
    quickActions: {
      title: "Ações rápidas",
      description: "Demonstrações locais de rotinas comuns.",
      muteMicrophones: "Silenciar todos os microfones",
      muteMicrophonesHint: "Silencie todas as entradas simuladas",
      disableCameras: "Desativar todas as câmeras",
      disableCamerasHint: "Entre no modo de privacidade simulado",
      recordingProfile: "Perfil Gravação",
      recordingProfileHint: "Selecione a configuração simulada de gravação",
    },
    loading: "Carregando dispositivos simulados",
    emptyTitle: "Nenhum dispositivo na fixture",
    emptyDescription:
      "Isto demonstra como a visão geral se comporta quando a descoberta não retorna dispositivos.",
    errorTitle: "Falha na descoberta da fixture",
    errorDescription:
      "Este erro simulado permanece visível em vez de recorrer a dados de dispositivos ocultos.",
    retry: "Tentar a fixture novamente",
    feedback: {
      refreshed: "Lista simulada de dispositivos atualizada.",
      deviceEnabled: "Dispositivo ativado nesta simulação.",
      deviceDisabled: "Dispositivo desativado nesta simulação.",
      privacyEnabled: "Modo de privacidade simulado ativado.",
      workApplied: "Perfil Trabalho simulado aplicado.",
      microphonesMuted: "Todos os microfones simulados foram silenciados.",
      camerasDisabled: "Todas as câmeras simuladas foram desativadas.",
      recordingApplied: "Perfil Gravação simulado aplicado.",
    },
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
