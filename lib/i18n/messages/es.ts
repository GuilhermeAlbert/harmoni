import type { Messages } from "@/lib/types/messages";

export const ES_MESSAGES = {
  metadata: {
    title: "Harmoni",
    description:
      "Gestión centralizada de dispositivos y periféricos para macOS.",
  },
  brand: {
    imageAlt: "Harmoni",
    subtitle: "Control de periféricos",
  },
  language: {
    label: "Idioma",
  },
  navigation: {
    mainLabel: "Navegación principal",
    workspace: "Espacio de trabajo",
    openMenu: "Abrir navegación",
    closeMenu: "Cerrar navegación",
  },
  routes: {
    overview: {
      label: "Resumen",
      subtitle: "Tu configuración activa de un vistazo.",
    },
    audio: {
      label: "Audio",
      subtitle: "Micrófonos, salidas, volumen y silencio.",
    },
    cameras: {
      label: "Cámaras",
      subtitle: "Cámara preferida y controles compatibles.",
    },
    peripherals: {
      label: "Periféricos",
      subtitle: "Teclados, ratones y dispositivos conectados.",
    },
    profiles: {
      label: "Perfiles",
      subtitle: "Cambia configuraciones completas de forma consistente.",
    },
    settings: {
      label: "Ajustes",
      subtitle: "Permisos y comportamiento de la aplicación.",
    },
  },
  routePlaceholder: {
    eyebrow: "Espacio de trabajo",
    description:
      "Esta ruta está lista para su especificación de producto dedicada.",
  },
  overview: {
    fixtureLabel: "Datos simulados de fixture",
    eyebrow: "Resumen del sistema",
    title: "Todo conectado. Nada fuera de tono.",
    description:
      "Revisa los dispositivos activos, prueba rutinas comunes e inspecciona cada estado de la interfaz antes de conectar la detección nativa.",
    privacyMode: "Modo de privacidad",
    applyWorkProfile: "Aplicar perfil Trabajo",
    refresh: "Actualizar dispositivos",
    refreshing: "Actualizando dispositivos",
    fixtureStateLabel: "Estado de la fixture",
    fixtureStateHint: "Elige un estado para previsualizar esta ruta.",
    states: {
      success: "Éxito",
      loading: "Cargando",
      empty: "Vacío",
      error: "Error",
    },
    metrics: {
      audioInput: "Entrada de audio",
      audioOutput: "Salida de audio",
      camera: "Cámara",
      peripherals: "Periféricos",
      connected: "conectados",
      noActiveDevice: "Ningún dispositivo activo",
      allResponding: "Todos los dispositivos compatibles responden",
      volume: "de volumen",
      muted: "Silenciado",
      unmuted: "Con sonido",
      zoom: "de zoom",
    },
    devices: {
      title: "Dispositivos conectados",
      description: "Activa o desactiva dispositivos compatibles de la fixture.",
      viewAll: "Ver todos",
      status: {
        active: "Activo",
        connected: "Conectado",
        disconnected: "Desconectado",
        unsupported: "Control no compatible",
        unavailable: "No disponible",
      },
      categories: {
        audioInput: "Micrófono",
        audioOutput: "Salida de audio",
        camera: "Cámara",
        keyboard: "Teclado",
        mouse: "Ratón",
        trackpad: "Trackpad",
      },
      battery: "de batería",
      enable: "Activar dispositivo",
      disable: "Desactivar dispositivo",
    },
    quickActions: {
      title: "Acciones rápidas",
      description: "Demostraciones locales de rutinas comunes.",
      muteMicrophones: "Silenciar todos los micrófonos",
      muteMicrophonesHint: "Silencia todas las entradas simuladas",
      disableCameras: "Desactivar todas las cámaras",
      disableCamerasHint: "Entra en el modo de privacidad simulado",
      recordingProfile: "Perfil Grabación",
      recordingProfileHint: "Selecciona la configuración simulada de grabación",
    },
    loading: "Cargando dispositivos simulados",
    emptyTitle: "No hay dispositivos en la fixture",
    emptyDescription:
      "Esto demuestra cómo se comporta el resumen cuando la detección no devuelve dispositivos.",
    errorTitle: "Falló la detección de la fixture",
    errorDescription:
      "Este error simulado permanece visible en lugar de recurrir a datos ocultos de dispositivos.",
    retry: "Probar la fixture de nuevo",
    feedback: {
      refreshed: "Lista simulada de dispositivos actualizada.",
      deviceEnabled: "Dispositivo activado en esta simulación.",
      deviceDisabled: "Dispositivo desactivado en esta simulación.",
      privacyEnabled: "Modo de privacidad simulado activado.",
      workApplied: "Perfil Trabajo simulado aplicado.",
      microphonesMuted: "Todos los micrófonos simulados fueron silenciados.",
      camerasDisabled: "Todas las cámaras simuladas fueron desactivadas.",
      recordingApplied: "Perfil Grabación simulado aplicado.",
    },
  },
  theme: {
    label: "Apariencia",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
  },
  preview: {
    eyebrow: "Base de diseño",
    title: "Controles precisos para cada dispositivo.",
    description:
      "Una base discreta y accesible para la interfaz de gestión de dispositivos de Harmoni.",
    controlsTitle: "Controles",
    controlsDescription:
      "Estados completos de interacción con una densidad compacta.",
    enabled: "Activado",
    disabled: "Desactivado",
    inputVolume: "Volumen de entrada",
    monitoringTitle: "Monitoreo de dispositivos",
    monitoringDescription: "Recibe cambios de conexión y estado.",
    primaryAction: "Acción principal",
    secondaryAction: "Secundaria",
    applying: "Aplicando",
    working: "Procesando",
    refreshDevices: "Actualizar dispositivos",
    deviceStatesTitle: "Estados de los dispositivos",
    deviceStatesDescription:
      "La información semántica nunca depende solo del color.",
    discoveringDevices: "Buscando dispositivos",
    noDevicesTitle: "Todavía no hay dispositivos",
    noDevicesDescription:
      "Los dispositivos conectados aparecerán aquí cuando la detección esté disponible.",
    checkAgain: "Comprobar de nuevo",
  },
} satisfies Messages;
