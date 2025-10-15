export const theme = {
  colors: {
    // Primary - Professional blue for trust and reliability
    primary: "#2563EB",
    primaryDark: "#1E40AF",
    primaryLight: "#3B82F6",

    // Secondary - Warm amber for accents and highlights
    secondary: "#F59E0B",
    secondaryDark: "#D97706",
    secondaryLight: "#FCD34D",

    // Status colors
    accent: "#10B981",
    success: "#10B981",
    successLight: "#D1FAE5",
    successDark: "#059669",
    error: "#EF4444",
    errorLight: "#FEE2E2",
    errorDark: "#DC2626",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    info: "#3B82F6",
    infoLight: "#DBEAFE",

    // Backgrounds
    background: "#F9FAFB",
    backgroundLight: "#F3F4F6",
    backgroundDark: "#E5E7EB",
    backgroundAlt: "#FFFFFF",

    // Text colors
    text: "#111827",
    textLight: "#6B7280",
    textMuted: "#9CA3AF",

    // Utility colors
    white: "#FFFFFF",
    black: "#000000",

    // Borders
    border: "#E5E7EB",
    borderLight: "#F3F4F6",
    borderDark: "#D1D5DB",

    // Component specific
    cardBg: "#FFFFFF",
    inputBg: "#F9FAFB",
    hoverBg: "#F3F4F6",
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontSize: "3.5rem",
      fontWeight: "700",
      lineHeight: "1.1",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: "600",
      lineHeight: "1.2",
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.875rem",
      fontWeight: "600",
      lineHeight: "1.3",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: "600",
      lineHeight: "1.4",
    },
    body: {
      fontSize: "1rem",
      fontWeight: "400",
      lineHeight: "1.6",
    },
    bodyLarge: {
      fontSize: "1.125rem",
      fontWeight: "400",
      lineHeight: "1.6",
    },
    small: {
      fontSize: "0.875rem",
      fontWeight: "400",
      lineHeight: "1.5",
    },
    tiny: {
      fontSize: "0.75rem",
      fontWeight: "400",
      lineHeight: "1.4",
    },
  },

  spacing: {
    element: "1rem",
    component: "2rem",
    section: "4rem",
    sectionMobile: "2rem",
  },

  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },

  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  breakpoints: {
    mobile: "768px",
    tablet: "1024px",
    desktop: "1280px",
  },

  transitions: {
    fast: "150ms ease",
    base: "200ms ease",
    slow: "300ms ease",
  },
}
