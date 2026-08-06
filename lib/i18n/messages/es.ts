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
