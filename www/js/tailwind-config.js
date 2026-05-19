tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#F08080",
        "primary-dark": "#D06060",
        "primary-light": "#F4978E",
        "primary-container": "#F8AD9D",
        "on-primary": "#ffffff",
        "on-primary-container": "#5a2525",
        "secondary": "#FBC4AB",
        "secondary-container": "#FFDAB9",
        "on-secondary": "#5a3d2b",
        "on-secondary-container": "#7a4d35",
        "background": "#ffffff",
        "on-background": "#1a1c1c",
        "surface": "#ffffff",
        "on-surface": "#1a1c1c",
        "surface-variant": "#e8e8e8",
        "on-surface-variant": "#5b4039",
        "surface-container": "#f3f3f3",
        "surface-container-low": "#fafafa",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "surface-container-lowest": "#ffffff",
        "outline": "#907067",
        "outline-variant": "#e4beb4",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "margin": "16px",
        "md": "16px",
        "gutter": "16px",
        "lg": "24px",
        "xl": "32px",
        "base": "4px",
        "xs": "4px",
        "sm": "8px"
      },
      fontFamily: {
        "label-lg": ["Inter"],
        "label-md": ["Inter"],
        "headline-lg": ["Inter"],
        "display-lg": ["Inter"],
        "body-lg": ["Inter"],
        "title-md": ["Inter"],
        "title-lg": ["Inter"],
        "headline-md": ["Inter"],
        "body-md": ["Inter"],
        "label-sm": ["Inter"]
      },
      fontSize: {
        "label-lg": ["14px", {"lineHeight": "20px", "letterSpacing": "0.1px", "fontWeight": "500"}],
        "label-md": ["12px", {"lineHeight": "18px", "letterSpacing": "0.2px", "fontWeight": "500"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "700"}],
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "title-md": ["16px", {"lineHeight": "24px", "fontWeight": "600"}],
        "title-lg": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "label-sm": ["11px", {"lineHeight": "16px", "letterSpacing": "0.5px", "fontWeight": "500"}]
      }
    }
  }
}
