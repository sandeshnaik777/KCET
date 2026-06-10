---
name: Academic Precision
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#43474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f88'
  primary: '#002045'
  on-primary: '#ffffff'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#adc7f7'
  secondary: '#1960a3'
  on-secondary: '#ffffff'
  secondary-container: '#7db6ff'
  on-secondary-container: '#00477f'
  tertiary: '#002713'
  on-tertiary: '#ffffff'
  tertiary-container: '#003f23'
  on-tertiary-container: '#4bb278'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#a2c9ff'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#004881'
  tertiary-fixed: '#91f8b8'
  tertiary-fixed-dim: '#74db9d'
  on-tertiary-fixed: '#002110'
  on-tertiary-fixed-variant: '#00522f'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

This design system is built on a foundation of **Corporate Modernism** with a focus on high-density information clarity. The brand personality is authoritative, reliable, and academic, designed to instill confidence in students making critical educational decisions. 

The aesthetic leans into a "Digital Paper" feel—clean white surfaces, crisp edges, and a structured hierarchy that prioritizes data legibility over decorative elements. It uses a mobile-first philosophy where touch targets are generous, but the visual language remains sophisticated and professional. The emotional response should be one of "calm certainty" amidst the stress of academic transitions.

## Colors

The palette is anchored by **Academic Navy Blue**, providing a sense of tradition and institutional trust. **Professional Royal Blue** is utilized for primary actions and interactive states to ensure high visibility against white backgrounds.

For predictive outcomes, the system uses a traffic-light semantic model:
- **Success (Emerald):** Indicates high probability or favorable data points.
- **Warning (Amber):** Signals caution or moderate probability.
- **Danger (Crimson):** Denotes low probability or critical errors.

In **Dark Mode**, surfaces should use deep navy-grays rather than pure black to maintain the professional tone, while primary blues are slightly desaturated to prevent optical vibration.

## Typography

The design system utilizes **Inter** for all roles to leverage its exceptional legibility in data-heavy environments. The hierarchy is "top-heavy," using bold weights and negative letter-spacing for headlines to create a strong editorial structure.

- **Data Readability:** For numerical data and table views, use `label-md` or `label-sm` with medium weights to ensure clarity at small scales.
- **Contrast:** Ensure a clear distinction between `body-md` (narrative text) and `label-md` (interactive/form text) by varying weights rather than just size.

## Layout & Spacing

The system employs a **Fluid Grid** model based on a 4px baseline rhythm. 

- **Mobile (Default):** A single-column layout with 20px side margins. Content cards should span the full width of the safe area.
- **Desktop:** A 12-column grid with a maximum content width of 1280px. Gutters are fixed at 24px to maintain whitespace in data-rich tables.
- **Spacing Logic:** Use `md (16px)` for internal card padding and `lg (24px)` for vertical stack spacing between distinct content sections.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and soft, diffused shadows. 

- **Surface Level 0:** The main background, using the Neutral Crisp White (#FFFFFF) or Soft Gray (#F7FAFC).
- **Surface Level 1 (Cards):** Raised with a subtle shadow (Y: 2px, Blur: 8px, 5% Opacity Black). This is the primary container for all predictive data.
- **Surface Level 2 (Modals/Popovers):** Elevated with a more pronounced shadow (Y: 10px, Blur: 20px, 10% Opacity Black) to indicate temporary interaction.

Avoid heavy borders; use light 1px strokes (#E2E8F0) only when elements need to be differentiated on high-brightness displays.

## Shapes

The design system uses a **Rounded** shape language to balance professional rigor with approachability. 

- **Cards & Containers:** Use `rounded-lg` (16px) to create a soft frame for complex data.
- **Buttons & Inputs:** Use 8px (base roundedness) to maintain a precise, "tool-like" feel.
- **Small Elements:** Use 4px for tags, badges, and tooltips.

This consistent radius helps soften the impact of high-density text and makes the mobile interface feel more organic to touch.

## Components

### Buttons
Primary buttons use the Professional Royal Blue with white text. They should have a minimum height of 48px on mobile to ensure a comfortable tap target. Secondary buttons should use a light blue ghost style or an outline with 1px stroke.

### Cards
Predictor results are housed in cards. High-chance results should include a 4px left-border accent in Emerald Green to provide an immediate visual cue without overwhelming the layout.

### Input Fields
Inputs use a 1px border (#E2E8F0) that thickens to 2px in Academic Navy Blue on focus. Labels must always be visible (above the field) to maintain context during data entry.

### Chips & Badges
Used for category filtering (e.g., "Engineering", "Medical"). Use `label-sm` with a light gray background and high-contrast text. When active, chips switch to a Primary Navy background with white text.

### Progress Indicators
For "Chance of Admission," use a horizontal thick-gauge bar with rounded caps, colored according to the status (Green/Yellow/Red).