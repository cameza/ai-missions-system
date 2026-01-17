# UI Specification: Transfer Hub

**Mission:** Week 4 - Transfer Hub  
**Designer:** [Name]  
**Date:** January 16, 2026  
**Status:** Approved for Development  
**Version:** 1.0

---

## 1. Overview

### Design Summary
Transfer Hub is a high-performance, dark-mode-first dashboard for tracking football transfers with a premium gaming/esports aesthetic—high contrast, neon accents, glassmorphism, and sleek typography.

### Design Principles
- **Dark Mode First:** Optimized for low-light viewing with esports-inspired visual hierarchy
- **Data Density:** Maximum information visibility without overwhelming users
- **Performance First:** Fast loading and smooth interactions for real-time data
- **Accessibility as Default:** WCAG 2.1 AA compliance in dark mode

### User Experience Goals
- Users can scan market pulse in under 30 seconds
- Zero learning curve for football transfer navigation
- Delightful micro-interactions that enhance data exploration

### Application Zones

| Zone Type | Definition | Elements |
| :--- | :--- | :--- |
| **Stable Zone** <br>(Locked) | Core UX structure and Data display | • Main Dashboard Grid Layout<br>• Transfer Table Columns<br>• KPI Card Logic<br>• Navigation Structure |
| **Flexible Zone** <br>(Iterative) | Visual Polish and Micro-interactions | • Exact gradient angles<br>• Animation curves<br>• "Insider Feed" content layout<br>• Mobile sidebar behavior |
| **Exploratory Zone** <br>(TBD) | Future Features | • User Accounts/Profile UI<br>• Prediction/Betting UI overlays |

---

## 2. Design System

### Color Palette

**Primary Colors:**
```
Primary: #8B5CF6 - Electric Purple (Buttons/Gradients)
Primary Hover: #7C3AED - Darker Purple
Primary Active: #6D28D9 - Darkest Purple
Primary Glow: rgba(139, 92, 246, 0.5)
```

**Secondary Colors:**
```
Secondary: #3B82F6 - Bright Blue (Info/Links)
Secondary Hover: #2563EB
Secondary Active: #1D4ED8
```

**Neutral Colors:**
```
Background: #0B0B15 - Deep blue-black
Surface: #12121A - Slightly lighter card bg
Surface Hover: #1A1A24
Surface Border: #2A2A35
Text Primary: #FFFFFF
Text Secondary: #94A3B8 - Blue-gray muted
Text Tertiary: #64748B
```

**Semantic Colors:**
```
Success: #00FF88 - Neon Green (Success/Up trends)
Warning: #F59E0B
Error: #EF4444 - Red (Down trends/Errors)
Info: #3B82F6
```

### Typography

**Font Family:**
- Primary: Chakra Petch or Rajdhani (Headers) - Square, technical, energetic
- Body: Inter or Geist Sans - Clean, highly legible at small sizes
- Monospace: Fira Code

**Type Scale:**
```
Heading 1: 48px / 1.1 / 900 (font-black italic uppercase)
Heading 2: 36px / 1.2 / 800 (font-bold italic uppercase)
Heading 3: 24px / 1.3 / 700 (font-bold uppercase)
Body Large: 18px / 1.5 / 500 (font-medium)
Body: 16px / 1.5 / 400 (font-normal)
Body Small: 14px / 1.5 / 500 (font-medium)
Caption: 12px / 1.4 / 700 (font-bold uppercase tracking-wider)
```

### Spacing System
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

### Border Radius
```
sm: 4px - Small elements (badges, tags)
md: 8px - Standard elements (buttons, inputs)
lg: 12px - Cards, containers
full: 9999px - Pills, avatars
```

### Shadows
```
sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05) - Subtle elevation
md: 0 4px 6px -1px rgba(0, 0, 0, 0.1) - Standard elevation
lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1) - Prominent elevation
xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1) - Modal/dialog elevation
```

### Breakpoints
```
Mobile: 320px - 639px
Tablet: 640px - 1023px
Desktop: 1024px - 1439px
Large Desktop: 1440px+
```

---

## 3. Component Library

### Button

**Variants:**
- **Primary:** Main call-to-action (Electric Purple)
- **Secondary:** Secondary actions (Bright Blue)
- **Ghost:** Subtle actions
- **Gradient:** Electric Purple to Indigo

**Sizes:**
- **Small:** 32px height, 12px padding
- **Medium:** 40px height, 16px padding
- **Large:** 48px height, 20px padding

**States:**
- Default
- Hover (scale-105)
- Active
- Disabled
- Loading

**Specifications:**
```
Primary Button (Medium):
- Height: 40px
- Padding: 0 16px
- Border radius: 8px (rounded-md)
- Font: 14px / 700 italic uppercase
- Background: #8B5CF6
- Text: White
- Hover: #7C3AED, scale-105
- Focus: 2px ring, accent-green
```

### KPI Card

**Purpose:** High-level metrics at a glance

**Specifications:**
```
KPI Card:
- Background: surface (#12121A)
- Border: 1px solid surface-border (#2A2A35)
- Border radius: 8px
- Padding: 20px 24px
- Value: 30px / 900 italic white
- Label: 12px / 700 uppercase text-secondary tracking-wider
- Context: Small colored text right-aligned
```

### Transfer Table

**Structure:**
- Header Row with uppercase labels
- Interactive rows with hover states
- 5 columns: Player, From, To, Fee, Status

**Specifications:**
```
Transfer Table:
- Header: 12px / 700 uppercase text-secondary border-b surface-border
- Row: hover:bg-surface-hover transition-colors cursor-pointer group
- Cell padding: 12px 16px
- Border bottom: 1px solid surface-border
```

### Status Badge

**Variants:**
- **Done:** Emerald green
- **Pending:** Purple
- **Rumor:** Yellow

**Specifications:**
```
Status Badge:
- Shape: Small pill (rounded-full)
- Padding: 2px 8px
- Font: 10px / 700 uppercase
- Done: bg-emerald-500/10 text-emerald-500 border emerald-500/20
- Pending: bg-purple-500/10 text-purple-500 border purple-500/20
- Rumor: bg-yellow-500/10 text-yellow-500 border yellow-500/20
```

### Sidebar List Item

**Purpose:** Display top transfers with ranking

**Specifications:**
```
Sidebar List Item:
- Number: 24px / 900 italic primary/50 (e.g., "01")
- Name: 14px / 700 white
- Route: 12px / 400 text-secondary
- Value: 14px / 700 white right-aligned
- Separator: border-b surface-border
- Padding: 12px 16px
```

---

## 4. Screen Specifications

### Screen 1: Dashboard

**Purpose:** Main dashboard for monitoring transfer market activity

**User Flow:**
1. User lands on dashboard
2. Scans KPI cards for market overview
3. Views charts for trends
4. Drills down into transfer table
5. Uses sidebar for top transfers/insider feed

**Layout Structure:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│                           Header                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                    KPI Row (4 cards)                                   │
│                                                                          │
├──────────────────────────────────────┬───────────────────────────────────┤
│  Left Column (65%)                    │  Right Column (35%)               │
│                                      │                                   │
│  ┌───────────────────────────────┐   │  ┌─────────────────────────────┐  │
│  │   Transfers By League        │   │  │     Daily Activity          │  │
│  └───────────────────────────────┘   │  └─────────────────────────────┘  │
│                                      │                                   │
│  ┌───────────────────────────────┐   │  ┌─────────────────────────────┐  │
│  │   Top Teams Volume            │   │  │      Sidebar Tabs            │  │
│  └───────────────────────────────┘   │  │  [Top] [Latest] [Feed]       │  │
│                                      │  └─────────────────────────────┘  │
│  ┌───────────────────────────────┐   │                                   │
│  │                             │   │  ┌─────────────────────────────┐  │
│  │   ALL MARKET TRANSFERS       │   │  │      Top Transfers          │  │
│  │   [Search] [Filter]          │   │  │  01 Player Name              │  │
│  │                             │   │  │  02 Player Name              │  │
│  │   [ TABLE DATA ]            │   │  │                             │  │
│  └───────────────────────────────┘   │  └─────────────────────────────┘  │
│                                      │                                   │
└──────────────────────────────────────┴───────────────────────────────────┘
```

**Components Used:**
- Header with logo, search, account
- KPI Cards (4)
- Bar Chart (Transfers by League)
- Horizontal Bar Chart (Top Teams Volume)
- Line Chart (Daily Activity)
- Sidebar with tabs
- Transfer Table
- Status Badges

**Responsive Behavior:**
- **Mobile (320-639px):** Single column, KPIs 2x2 grid, charts simplified, sidebar moves to bottom
- **Tablet (640-1023px):** Similar to desktop but compressed spacing
- **Desktop (1024px+):** Full 65/35 split layout as shown above

**Interactive Elements:**
- **KPI Cards:** Hover shows border highlight
- **Table Rows:** Click to view details, hover highlights row
- **Sidebar Tabs:** Switch between Top/Latest/Feed
- **Search/Filter:** Real-time filtering of transfers

**States:**
- **Loading:** Skeleton screens for all components
- **Empty:** "No transfers found" with clear filters button
- **Error:** Error message with retry option
- **Success:** Normal data display

**Accessibility:**
- Heading hierarchy: H1 (Transfer Hub) → H2 (sections) → H3 (component titles)
- Focus order: Header → KPIs → Charts → Sidebar → Table
- ARIA labels: All charts, badges, interactive elements
- Keyboard shortcuts: Tab navigation, Enter to activate

---

### Screen 2: Team Detail

**Purpose:** Detailed view of specific team transfers

**User Flow:**
1. User clicks team from transfer table
2. Lands on team detail page
3. Views team header with stats
4. Scans incoming/outgoing transfers
5. Can navigate back to dashboard

**Layout Structure:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│                           Header                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                      Team Header                                        │
│                  [Logo] [Name] [Stats]                                   │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │      Incoming Transfers       │  │      Outgoing Transfers         │  │
│  │                               │  │                                 │  │
│  │   [ TABLE DATA ]             │  │   [ TABLE DATA ]                 │  │
│  │                               │  │                                 │  │
│  └───────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Components Used:**
- Header
- Team Header (logo, name, stats)
- Transfer Tables (2)
- Status Badges
- Back navigation

**Responsive Behavior:**
- **Mobile:** Stacked layout, single column
- **Tablet:** Side-by-side tables
- **Desktop:** Full layout with optimal spacing

---

## 5. User Flows

### Flow 1: Market Monitoring & Discovery

**Goal:** Users quickly assess market activity and drill down into specific transfers

**Steps:**
1. **Dashboard Landing**
   - User sees: KPI cards, charts, transfer table
   - User action: Scan KPIs for market pulse
   - System response: Clear metrics displayed instantly
   
2. **Chart Exploration**
   - User sees: League trends, team volume, daily activity
   - User action: Hover over charts for details
   - System response: Tooltips show specific data points
   
3. **Table Filtering**
   - User sees: All market transfers
   - User action: Search player/team or filter by league/position
   - System response: Real-time table updates with results
   
4. **Transfer Details**
   - User sees: Transfer row in table
   - User action: Click team or player name
   - System response: Navigate to team detail or open player modal

**Alternative Paths:**
- **Error Path:** Network error shows toast with retry option
- **No Results Path:** "No transfers found" with clear filters button
- **Sidebar Navigation:** Click top transfers to jump directly to table rows

**Success Criteria:**
- User finds specific transfer in under 10 seconds
- Clear visual hierarchy guides attention naturally
- Smooth interactions maintain engagement

---

### Flow 2: Team Deep Dive

**Goal:** Users explore complete transfer history for specific teams

**Steps:**
1. **Team Selection**
   - User sees: Team name/logo in transfer table
   - User action: Click team name
   - System response: Navigate to team detail page
   
2. **Team Overview**
   - User sees: Team header with logo, name, key stats
   - User action: Scan team information
   - System response: Clear team context displayed
   
3. **Transfer Analysis**
   - User sees: Incoming and outgoing transfer tables
   - User action: Scroll through transfer history
   - System response: Comprehensive transfer data with status badges

**Success Criteria:**
- Complete team transfer picture in single view
- Easy navigation back to main dashboard
- Clear separation of incoming/outgoing transfers

---

## 6. Interactions & Animations

### Micro-interactions

**KPI Card Hover:**
```
Trigger: User hovers over KPI card
Animation: Border color changes to primary/50, duration 300ms
Feedback: Subtle highlight effect
```

**Button Click:**
```
Trigger: User clicks primary button
Animation: Scale to 0.95, duration 100ms, then scale back
Feedback: Visual press effect with smooth transition
```

**Table Row Hover:**
```
Trigger: User hovers over transfer row
Animation: Background changes to surface-hover, duration 200ms
Feedback: Arrow icon appears at end of row
```

**Card Hover:**
```
Trigger: User hovers over any card component
Animation: Border color changes to primary/50, duration 300ms
Feedback: Cursor changes to pointer
```

### Page Transitions

**Route Change:**
```
Exit: Fade out, duration 150ms
Enter: Fade in, duration 150ms
Easing: ease-in-out
```

**Modal Open/Close:**
```
Open: Backdrop fade in + content scale up, duration 200ms
Close: Backdrop fade out + content scale down, duration 150ms
```

### Loading States

**Skeleton Screens:**
- Match exact layout of actual content
- Pulse animation, duration 1.5s
- Background: surface-border/50

**Spinners:**
- Size: 20px (small), 32px (medium)
- Color: Primary color
- Smooth rotation animation

### Animation Principles
- Duration: 200-300ms for most interactions
- Easing: ease-in-out for smooth transitions
- Respect `prefers-reduced-motion`
- 60fps performance target

---

## 7. Responsive Design

### Mobile (320-639px)

**Layout:**
- Single column layout
- Full-width components
- Bottom navigation for sidebar
- Collapsible chart sections

**Typography:**
- Slightly smaller font sizes for space
- Increased line height for readability

**Interactions:**
- Touch targets minimum 44x44px
- Swipe gestures for charts
- Pull-to-refresh for data

**Navigation:**
- Hamburger menu for main nav
- Sidebar becomes tabbed interface at bottom

### Tablet (640-1023px)

**Layout:**
- Two-column layout where appropriate
- Sidebar navigation
- Adaptive grid system

**Typography:**
- Standard font sizes
- Comfortable reading width

**Interactions:**
- Support both touch and mouse
- Hover states for mouse users

### Desktop (1024px+)

**Layout:**
- Multi-column layouts (65/35 split)
- Sidebar navigation
- Maximum content width: 1440px
- Centered content with margins

**Typography:**
- Full type scale
- Optimal line length (60-80 characters)

**Interactions:**
- Full hover states
- Keyboard shortcuts
- Tooltips on hover

---

## 8. Accessibility Specifications

### Keyboard Navigation

**Tab Order:**
1. Header navigation
2. KPI cards
3. Chart interactions
4. Sidebar tabs
5. Transfer table rows
6. Filter controls

**Keyboard Shortcuts:**
- `Tab`: Move to next focusable element
- `Shift + Tab`: Move to previous element
- `Enter`: Activate button/link/row
- `Escape`: Close modal/dialog
- `Arrow keys`: Navigate table rows

### Screen Reader Support

**ARIA Labels:**
- All interactive elements have descriptive labels
- Form inputs have associated labels
- Icons have aria-label or aria-labelledby
- Status badges: aria-label="Transfer Status: Done"

**Landmarks:**
- `<header>` with role="banner"
- `<nav>` with role="navigation"
- `<main>` with role="main"
- `<aside>` with role="complementary"

**Live Regions:**
- Toast notifications: aria-live="polite"
- Error messages: aria-live="assertive"
- Loading states: aria-busy="true"

### Color Contrast

**Text Contrast Ratios:**
- Normal text: 4.5:1 minimum against #0B0B15
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Dark Mode Considerations:**
- Avoid text-gray-600, use text-gray-400 minimum
- Primary purple #8B5CF6 needs dark background or lighten to #A78BFA
- All combinations validated against #0B0B15 background

### Focus Indicators

**Specifications:**
- Visible focus outline on all interactive elements
- Outline: 2px solid accent-green (#00FF88)
- Offset: 2px from element
- Custom focus: ring-2 ring-accent-green ring-offset-2 ring-offset-background

---

## 9. Error States & Validation

### Form Validation

**Search/Filter Validation:**
- Validate on input (real-time)
- Show suggestions for misspellings
- Clear error messages

**Error Messages:**
- Specific and actionable
- Friendly tone
- Suggest how to fix

**Examples:**
```
❌ "Invalid search"
✅ "No players found matching 'Messi'. Try 'Messi' or browse all players."

❌ "Filter error"
✅ "No transfers in Premier League. Try 'All Leagues' or select a different league."
```

### Error States

**Search Error:**
- Red border on search input
- Error icon next to field
- Error message below input
- Suggestions for alternative searches

**Network Error:**
- Toast notification
- Retry button
- Clear error message
- Maintain user's filters

**Empty State:**
- Magnifying glass icon
- "No transfers found matching your filters."
- "Clear Filters" button

**Chart Loading Error:**
- Placeholder with error message
- Retry option
- Fallback to simple text display

---

## 10. Content Guidelines

### Voice & Tone

**Characteristics:**
- Professional but energetic (esports vibe)
- Clear and concise
- Data-driven and precise

**Examples:**
- Success: "Live data connected successfully"
- Error: "Connection lost. Retrying..."
- Empty: "No transfers found. Adjust filters to see more results."

### Microcopy

**Button Labels:**
- Use action verbs
- Be specific
- Keep short (1-3 words)

**Examples:**
- ✅ "View Details" | ❌ "Click"
- ✅ "Filter Transfers" | ❌ "Apply"
- ✅ "Clear All" | ❌ "Reset"

**Form Labels:**
- Clear and descriptive
- Avoid jargon
- Include hints if needed

**Placeholder Text:**
- Show example input
- Don't repeat label
- Helpful suggestions

---

## 11. Design Assets & Resources

### Figma/Design Files
- [Link to Transfer Hub mockup]
- [Link to design system]

### Icon Set
- **Library:** Lucide React
- **Style:** Outline
- **Sizes:** 16px, 20px, 24px

### Images
- **Format:** WebP with PNG fallback
- **Optimization:** Compressed, lazy-loaded
- **Alt text:** Required for all team logos and player images

### Fonts
- **Primary:** Chakra Petch - https://fonts.google.com/specimen/Chakra+Petch
- **Body:** Inter - https://fonts.google.com/specimen/Inter
- **Fallback:** System UI fonts

---

## 12. Implementation Notes

### CSS/Tailwind Approach
- Use Tailwind utility classes with custom color configuration
- Custom components in separate files
- Consistent spacing using design tokens
- Dark mode as default with custom color palette

### Component Structure
- Atomic design principles
- Reusable components in `/components/ui`
- Feature-specific components in `/components/features`
- Glassmorphism utility: `bg-surface/80 backdrop-blur-sm`

### Animation Implementation
- Use Tailwind transition utilities
- Custom CSS for complex chart animations
- Respect prefers-reduced-motion

### Chart Customization
- Recharts theme customization
- Remove grid lines for cleaner look
- Custom tooltips with neon styling
- Smooth hover animations

---

## 13. Quality Checklist

Before considering design complete:
- [ ] All screens designed for mobile, tablet, desktop
- [ ] All interactive states defined (hover, active, disabled)
- [ ] All error states designed
- [ ] Loading states designed (skeleton screens)
- [ ] Empty states designed
- [ ] Color contrast meets WCAG AA standards in dark mode
- [ ] Typography hierarchy is clear
- [ ] Spacing is consistent
- [ ] Components are reusable
- [ ] Accessibility requirements met
- [ ] Responsive behavior defined
- [ ] Animations are smooth (60fps)
- [ ] Design system documented

---

## 14. Open Questions

- [ ] **Player Modal MVP Scope:** Should player detail modal be included in MVP or postponed?
  - Options: Include basic modal, postpone to future iteration
  - Recommendation: Postpone to focus on core dashboard experience

---

## 15. References

- **PRD:** [Link to Transfer Hub PRD]
- **Tech Spec:** [Link to technical specification]
- **Design Inspiration:** Esports dashboards, dark mode data visualization
- **Accessibility Guidelines:** WCAG 2.1 AA

---

## Approval

- [ ] **PM Review:** Approved by [Name] on [Date]
- [ ] **Tech Lead Review:** Approved by [Name] on [Date]
- [ ] **Designer Sign-off:** [Name] on [Date]

**Status:** Ready for Implementation

---

## 16. Implementation Checklist

### Setup
- [ ] Install Shadcn/ui.
- [ ] Configure Tailwind with custom colors (`background`, `surface`, `accent`).
- [ ] Add `Chakra Petch` (headers) and `Inter` (body) fonts.

### Components
- [ ] Build `KPICard` component.
- [ ] Build `TransferRow` component (Desktop & Mobile variants).
- [ ] Build `SidebarTabs` component.
- [ ] Customize Recharts theme (remove grid lines, custom tooltips, neon strokes).

### Views
- [ ] Construct Dashboard Grid (CSS Grid/Flex).
- [ ] Implement Mobile "Card View" for transfers.
- [ ] Build "Soft Launch" limitations (hide complex filters initially).

### Polish
- [ ] Add glassmorphism utility: `bg-surface/80 backdrop-blur-sm`.
- [ ] Test tab navigation order.
- [ ] Verify contrast ratios.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 16, 2026 | Designer | Initial UI specification based on designer requirements |
