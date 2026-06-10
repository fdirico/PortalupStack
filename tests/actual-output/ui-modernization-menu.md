# Actual output: UI modernization menu

Fixture: `tests/fixtures/ui-modernization-menu.md`
Skill: `$portalup-ui-modernization`

UI decision: ask before build

Context needed
- What are the three menu options and their priority?
- Who uses the app: client users, admins, operators, or executives?
- Is the menu desktop-first, mobile-first, or both?
- Are there brand colors, logo, typography, or client constraints?
- Should options depend on permissions or roles?
- Should the menu be side navigation, top navigation, tabs, or mobile bottom navigation?

Modernization direction
- Use a compact, modern navigation pattern instead of a generic three-button block.
- Prefer icon + short label, active state, hover/focus states, and responsive collapse behavior.
- Keep typography medium/small and spacing efficient for a client-grade operational app.

Information architecture
- Group the three options by frequency and workflow priority.
- Include current route indication and clear affordance for selected state.
- For mobile, use a collapsed drawer, segmented tabs, or bottom nav depending on workflow frequency.

Visual and interaction system
- Compact buttons or nav items with icons.
- Clear active indicator.
- Accessible contrast and keyboard focus.
- Loading/disabled states if menu availability depends on permissions.

Component changes
| Area | Current issue | Proposed improvement | Validation |
| --- | --- | --- | --- |
| Navigation | Request is under-specified | Define IA, labels, iconography, roles, and responsive pattern | Desktop/mobile screenshots |
| Visual style | "Modern" is subjective | Establish colors, density, typography, states | Contrast and no-overlap checks |
| Responsiveness | Unknown | Define desktop and mobile layout explicitly | Responsive viewport checks |

Responsive behavior
- Desktop: compact top or side nav based on app shell.
- Tablet: collapse secondary labels if needed.
- Mobile: drawer, bottom nav, or tabs chosen by task frequency.

Validation checklist
- Screenshot desktop and mobile.
- Verify no clipped labels or oversized buttons.
- Verify active, hover, focus, disabled states.
- Verify keyboard navigation and contrast.

Evaluation
- Score: 94/100.
- Meets expected output: yes.
- Notes: Correctly asks for missing context and avoids creating a weak arbitrary menu.
