# UI Specification: [Mission Name]

**Mission:** Week [N] - [Mission Name]  
**Designer:** [Name]  
**Date:** [Date]  
**Status:** Draft | In Review | Approved  
**Version:** 1.0

---

## 1. Overview

### Design Summary
[2-3 sentence summary of the UI approach and design philosophy]

### Design Principles
- **Principle 1:** [e.g., Mobile-first design]
- **Principle 2:** [e.g., Accessibility as default]
- **Principle 3:** [e.g., Progressive disclosure]

### User Experience Goals
- [Goal 1: e.g., Users can complete primary task in < 2 minutes]
- [Goal 2: e.g., Zero learning curve for core features]
- [Goal 3: e.g., Delightful micro-interactions]

---

## 2. Design System

### Color Palette

**Primary Colors:**
```
Primary: #[hex] - Used for primary actions, key UI elements
Primary Hover: #[hex]
Primary Active: #[hex]
```

**Secondary Colors:**
```
Secondary: #[hex] - Used for secondary actions
Secondary Hover: #[hex]
Secondary Active: #[hex]
```

**Neutral Colors:**
```
Background: #[hex]
Surface: #[hex]
Border: #[hex]
Text Primary: #[hex]
Text Secondary: #[hex]
Text Disabled: #[hex]
```

**Semantic Colors:**
```
Success: #[hex]
Warning: #[hex]
Error: #[hex]
Info: #[hex]
```

### Typography

**Font Family:**
- Primary: [Font name] (e.g., Inter, System UI)
- Monospace: [Font name] (e.g., Fira Code)

**Type Scale:**
```
Heading 1: [size]px / [line-height] / [weight]
Heading 2: [size]px / [line-height] / [weight]
Heading 3: [size]px / [line-height] / [weight]
Body Large: [size]px / [line-height] / [weight]
Body: [size]px / [line-height] / [weight]
Body Small: [size]px / [line-height] / [weight]
Caption: [size]px / [line-height] / [weight]
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
xl: 16px - Large containers
full: 9999px - Pills, avatars
```

### Shadows
```
sm: [shadow values] - Subtle elevation
md: [shadow values] - Standard elevation
lg: [shadow values] - Prominent elevation
xl: [shadow values] - Modal/dialog elevation
```

### Breakpoints
```
Mobile: 320px - 767px
Tablet: 768px - 1023px
Desktop: 1024px - 1439px
Large Desktop: 1440px+
```

---

## 3. Component Library

### Button

**Variants:**
- **Primary:** Main call-to-action
- **Secondary:** Secondary actions
- **Danger:** Destructive actions
- **Ghost:** Subtle actions

**Sizes:**
- **Small:** 32px height, 12px padding
- **Medium:** 40px height, 16px padding
- **Large:** 48px height, 20px padding

**States:**
- Default
- Hover
- Active
- Disabled
- Loading

**Specifications:**
```
Primary Button (Medium):
- Height: 40px
- Padding: 0 16px
- Border radius: 8px
- Font: 14px / 600
- Background: Primary color
- Text: White
- Hover: Primary hover color
- Focus: 2px outline, primary color
```

### Input Field

**Types:**
- Text input
- Number input
- Email input
- Password input
- Textarea
- Select/Dropdown
- Date picker

**States:**
- Default
- Focus
- Error
- Disabled
- Success

**Specifications:**
```
Text Input:
- Height: 40px
- Padding: 0 12px
- Border: 1px solid border color
- Border radius: 8px
- Font: 14px / 400
- Focus: 2px border, primary color
- Error: 2px border, error color
```

### Card

**Variants:**
- Default
- Elevated
- Outlined
- Interactive (clickable)

**Specifications:**
```
Default Card:
- Padding: 16px
- Border radius: 12px
- Background: Surface color
- Border: 1px solid border color
- Shadow: sm (optional)
```

### Modal/Dialog

**Sizes:**
- Small: 400px max-width
- Medium: 600px max-width
- Large: 800px max-width
- Full: 90vw max-width

**Specifications:**
```
Modal:
- Backdrop: rgba(0,0,0,0.5)
- Container: Surface color
- Border radius: 16px
- Padding: 24px
- Shadow: xl
- Animation: Fade in + scale
```

### Toast/Notification

**Types:**
- Success
- Error
- Warning
- Info

**Position:**
- Top right (default)
- Top center
- Bottom right
- Bottom center

**Specifications:**
```
Toast:
- Width: 320px max
- Padding: 12px 16px
- Border radius: 8px
- Shadow: md
- Duration: 3-5 seconds
- Animation: Slide in from right
```

---

## 4. Screen Specifications

### Screen 1: [Screen Name]

**Purpose:** [What this screen does]

**User Flow:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Layout Structure:**
```
┌─────────────────────────────────────┐
│           Header/Nav                │
├─────────────────────────────────────┤
│                                     │
│         Main Content Area           │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │  Component  │  │  Component  │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Components Used:**
- [Component 1]
- [Component 2]
- [Component 3]

**Responsive Behavior:**
- **Mobile (320-767px):** [Description of mobile layout]
- **Tablet (768-1023px):** [Description of tablet layout]
- **Desktop (1024px+):** [Description of desktop layout]

**Interactive Elements:**
- **Element 1:** [Interaction description]
- **Element 2:** [Interaction description]

**States:**
- **Loading:** [What user sees while loading]
- **Empty:** [What user sees when no data]
- **Error:** [What user sees on error]
- **Success:** [What user sees after successful action]

**Accessibility:**
- Heading hierarchy: H1 → H2 → H3
- Focus order: [Describe tab order]
- ARIA labels: [List required ARIA labels]
- Keyboard shortcuts: [If applicable]

---

### Screen 2: [Screen Name]

[Repeat structure from Screen 1]

---

## 5. User Flows

### Flow 1: [Flow Name]

**Goal:** [What the user wants to accomplish]

**Steps:**
1. **[Screen/State]**
   - User sees: [Description]
   - User action: [What they do]
   - System response: [What happens]
   
2. **[Screen/State]**
   - User sees: [Description]
   - User action: [What they do]
   - System response: [What happens]
   
3. **[Screen/State]**
   - User sees: [Description]
   - Success state: [Final result]

**Alternative Paths:**
- **Error Path:** [What happens if something goes wrong]
- **Cancel Path:** [What happens if user cancels]

**Success Criteria:**
- User completes flow in < [X] steps
- No confusion about next action
- Clear feedback at each step

---

### Flow 2: [Flow Name]

[Repeat structure from Flow 1]

---

## 6. Interactions & Animations

### Micro-interactions

**Button Click:**
```
Trigger: User clicks button
Animation: Scale down to 0.95, duration 100ms
Feedback: Visual press effect
```

**Form Submission:**
```
Trigger: User submits form
Animation: Button shows loading spinner
Feedback: Disabled state, loading indicator
Success: Toast notification, form clears
```

**Card Hover:**
```
Trigger: User hovers over card
Animation: Lift effect (shadow increases), duration 200ms
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
- Use for initial page load
- Match layout of actual content
- Pulse animation, duration 1.5s

**Spinners:**
- Use for in-progress actions
- Size: 20px (small), 32px (medium), 48px (large)
- Color: Primary color

**Progress Bars:**
- Use for multi-step processes
- Height: 4px
- Color: Primary color
- Smooth animation

### Animation Principles
- Duration: 100-300ms for most interactions
- Easing: ease-in-out for most animations
- Respect `prefers-reduced-motion`
- 60fps performance target

---

## 7. Responsive Design

### Mobile (320-767px)

**Layout:**
- Single column layout
- Full-width components
- Bottom navigation (if applicable)
- Collapsible sections

**Typography:**
- Slightly smaller font sizes
- Increased line height for readability

**Interactions:**
- Touch targets minimum 44x44px
- Swipe gestures (if applicable)
- Pull-to-refresh (if applicable)

**Navigation:**
- Hamburger menu or bottom nav
- Simplified navigation structure

### Tablet (768-1023px)

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
- Multi-column layouts
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
1. [Element 1]
2. [Element 2]
3. [Element 3]

**Keyboard Shortcuts:**
- `Tab`: Move to next focusable element
- `Shift + Tab`: Move to previous element
- `Enter`: Activate button/link
- `Escape`: Close modal/dialog
- [Custom shortcuts if applicable]

### Screen Reader Support

**ARIA Labels:**
- All interactive elements have descriptive labels
- Form inputs have associated labels
- Icons have aria-label or aria-labelledby

**Landmarks:**
- `<header>` with role="banner"
- `<nav>` with role="navigation"
- `<main>` with role="main"
- `<footer>` with role="contentinfo"

**Live Regions:**
- Toast notifications: aria-live="polite"
- Error messages: aria-live="assertive"
- Loading states: aria-busy="true"

### Color Contrast

**Text Contrast Ratios:**
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Color Independence:**
- Never use color alone to convey information
- Use icons, text, or patterns as additional indicators

### Focus Indicators

**Specifications:**
- Visible focus outline on all interactive elements
- Outline: 2px solid primary color
- Offset: 2px from element
- Never remove focus styles without replacement

---

## 9. Error States & Validation

### Form Validation

**Inline Validation:**
- Validate on blur (after user leaves field)
- Show error message below field
- Red border on invalid field
- Icon indicator (error icon)

**Error Messages:**
- Specific and actionable
- Friendly tone
- Suggest how to fix

**Examples:**
```
❌ "Invalid input"
✅ "Email must include @ symbol"

❌ "Error"
✅ "Password must be at least 8 characters"
```

### Error States

**Form Error:**
- Red border on invalid fields
- Error icon next to field
- Error message below field
- Submit button remains enabled (to show all errors)

**Network Error:**
- Toast notification
- Retry button
- Clear error message
- Maintain user's input

**Empty State:**
- Illustration or icon
- Helpful message
- Call-to-action to add first item

**404 / Not Found:**
- Clear message
- Link back to home
- Search functionality (if applicable)

---

## 10. Content Guidelines

### Voice & Tone

**Characteristics:**
- [e.g., Friendly but professional]
- [e.g., Clear and concise]
- [e.g., Encouraging and positive]

**Examples:**
- Success: "Great! Your goal has been saved."
- Error: "Oops! Something went wrong. Please try again."
- Empty: "No goals yet. Create your first goal to get started!"

### Microcopy

**Button Labels:**
- Use action verbs
- Be specific
- Keep short (1-3 words)

**Examples:**
- ✅ "Create Goal" | ❌ "Submit"
- ✅ "Save Changes" | ❌ "OK"
- ✅ "Delete Goal" | ❌ "Delete"

**Form Labels:**
- Clear and descriptive
- Avoid jargon
- Include hints if needed

**Placeholder Text:**
- Show example input
- Don't repeat label
- Optional, not required

---

## 11. Design Assets & Resources

### Figma/Design Files
- [Link to Figma file]
- [Link to design system]

### Icon Set
- **Library:** Lucide React
- **Style:** Outline
- **Sizes:** 16px, 20px, 24px

### Images
- **Format:** WebP with PNG fallback
- **Optimization:** Compressed, lazy-loaded
- **Alt text:** Required for all images

### Fonts
- **Primary:** [Font name] - [Link to Google Fonts or font file]
- **Fallback:** System UI fonts

---

## 12. Implementation Notes

### CSS/Tailwind Approach
- Use Tailwind utility classes
- Custom components in separate files
- Consistent spacing using design tokens
- Dark mode support (if applicable)

### Component Structure
- Atomic design principles
- Reusable components in `/components/ui`
- Feature-specific components in `/components/features`

### Animation Implementation
- Use Tailwind transition utilities
- Framer Motion for complex animations
- CSS animations for simple effects

---

## 13. Quality Checklist

Before considering design complete:
- [ ] All screens designed for mobile, tablet, desktop
- [ ] All interactive states defined (hover, active, disabled)
- [ ] All error states designed
- [ ] Loading states designed
- [ ] Empty states designed
- [ ] Color contrast meets WCAG AA standards
- [ ] Typography hierarchy is clear
- [ ] Spacing is consistent
- [ ] Components are reusable
- [ ] Accessibility requirements met
- [ ] Responsive behavior defined
- [ ] Animations are smooth (60fps)
- [ ] Design system documented

---

## 14. Open Questions

- [ ] **Question 1:** [What needs to be decided?]
  - Options: [Option A, Option B]
  - Recommendation: [Your recommendation]

---

## 15. References

- **PRD:** [Link to PRD document]
- **Tech Spec:** [Link to technical specification]
- **Design Inspiration:** [Links to inspiration]
- **Accessibility Guidelines:** [WCAG 2.1 AA]

---

## Approval

- [ ] **PM Review:** Approved by [Name] on [Date]
- [ ] **Tech Lead Review:** Approved by [Name] on [Date]
- [ ] **Designer Sign-off:** [Name] on [Date]

**Status:** Ready for Implementation | Needs Revision

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Name] | Initial draft |
| 1.1 | [Date] | [Name] | [Changes made] |
