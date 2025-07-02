# Global Theme Variables Reference

This document outlines the recommended global theme variables for consistent theming across the Reflection Edge application. Use these variables in your Tailwind config or CSS for maintainable, scalable design.

---

## 1. Text Colors
| Variable Name         | Description / Usage                                 |
|----------------------|-----------------------------------------------------|
| `text-main`          | Main body text, default foreground                  |
| `text-secondary`     | Secondary/less important text, descriptions         |
| `text-title`         | Feature/page titles, section headers                |
| `text-subtitle`      | Subtitles, card headers                             |
| `text-accent`        | Brand accent text (e.g., purple, blue)              |
| `text-positive`      | Positive/increase values (e.g., +P&L, success)      |
| `text-negative`      | Negative/decrease values (e.g., -P&L, errors)       |
| `text-warning`       | Warning/alert text                                  |
| `text-link`          | Hyperlinks, clickable text                          |
| `text-muted`         | Muted/disabled text                                 |
| `text-white`         | Pure white (for special cases, e.g., on buttons)    |

## 2. Background Colors
| Variable Name             | Description / Usage                        |
|--------------------------|--------------------------------------------|
| `background-main`        | Main app background                        |
| `background-secondary`   | Card, panel, or widget backgrounds         |
| `background-tertiary`    | Inputs, dropdowns, or subtle backgrounds   |
| `background-accent`      | Accent backgrounds (e.g., for highlights)  |
| `background-positive`    | For positive/success backgrounds           |
| `background-negative`    | For negative/error backgrounds             |
| `background-warning`     | For warning/alert backgrounds              |
| `background-gradient`    | For gradient backgrounds                   |

## 3. Border Colors
| Variable Name      | Description / Usage                |
|-------------------|------------------------------------|
| `border-main`     | Default border color                |
| `border-accent`   | Accent/brand border color           |
| `border-positive` | For positive/success borders        |
| `border-negative` | For negative/error borders          |
| `border-warning`  | For warning/alert borders           |

## 4. Button Colors
| Variable Name         | Description / Usage                        |
|----------------------|--------------------------------------------|
| `button-primary`     | Main action buttons                        |
| `button-primary-hover`| Hover state for primary buttons           |
| `button-secondary`   | Secondary/less important buttons           |
| `button-secondary-hover`| Hover state for secondary buttons        |
| `button-danger`      | Destructive/danger buttons                 |
| `button-danger-hover`| Hover state for danger buttons             |
| `button-success`     | Success/positive action buttons            |
| `button-success-hover`| Hover state for success buttons           |
| `button-disabled`    | Disabled button background                 |
| `button-text`        | Button text color                         |

## 5. State/Feedback Colors
| Variable Name         | Description / Usage                        |
|----------------------|--------------------------------------------|
| `state-success`      | Success messages, icons, badges            |
| `state-error`        | Error messages, icons, badges              |
| `state-warning`      | Warning messages, icons, badges            |
| `state-info`         | Informational messages, icons, badges      |

## 6. Shadows & Effects
| Variable Name         | Description / Usage                        |
|----------------------|--------------------------------------------|
| `shadow-main`        | Main card/widget shadow                    |
| `shadow-hover`       | Shadow on hover/focus                      |

## 7. Font Families & Sizes
| Variable Name         | Description / Usage                        |
|----------------------|--------------------------------------------|
| `font-main`          | Main font family                           |
| `font-title`         | Font for titles/headers                    |
| `font-mono`          | Monospace font (for code, numbers, etc.)   |
| `text-xs`/`text-sm`/`text-lg`/etc. | Font size utilities         |

---

## Section-Specific Suggestions

### Controls Panel
- Use `background-secondary` for panel background
- Use `text-title` for section header
- Use `button-primary` for Apply/Filter buttons

### Widgets (KPIs, Charts, Lists)
- Use `background-secondary` for widget/card backgrounds
- Use `text-title` for widget titles
- Use `text-positive`/`text-negative` for P&L, win/loss, etc.
- Use `border-main` for card borders

### Tags & Filters
- Use `background-accent` for selected tags
- Use `text-accent` for tag text
- Use `background-tertiary` for tag backgrounds

### Trade Log
- Use `background-secondary` for table background
- Use `text-main` for table text
- Use `text-positive`/`text-negative` for P&L values
- Use `button-secondary` for "Go to Full Trade Log" button

### Sidebar
- Use `background-main` for sidebar
- Use `text-main` for main text
- Use `text-accent` for logo/brand
- Use `button-success` for "Add Trade" button

---

> **Tip:** When adding new UI elements, reference this list to ensure consistent theming across the app. 