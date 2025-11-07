# Design Guidelines: Art Institute of Chicago Artwork Data Table

## Design Approach

**Selected Approach**: Design System - Material Design principles adapted for data-intensive applications

**Justification**: This is a utility-focused data table application requiring clear hierarchy, efficient scanning, and intuitive interactions. Material Design provides excellent patterns for data tables, selection states, and overlay components that align perfectly with PrimeReact's component library.

**Key Design Principles**:
- Data clarity above all - optimize for quick scanning and comprehension
- Clear visual feedback for all interactive states
- Consistent spacing rhythm for predictable layout
- Purposeful use of elevation for layered UI elements

---

## Core Design Elements

### A. Typography

**Font Family**: 
- Primary: 'Inter' or 'Roboto' via Google Fonts CDN
- Fallback: system-ui, -apple-system, sans-serif

**Typography Scale**:
- Page Title: text-2xl font-semibold (24px)
- Section Headers: text-lg font-medium (18px)
- Table Headers: text-sm font-semibold uppercase tracking-wide (14px)
- Table Data: text-base font-normal (16px)
- Helper Text/Labels: text-sm font-normal (14px)
- Button Text: text-sm font-medium (14px)

**Reading Optimization**:
- Table cells: Regular weight for better scannability
- Headers: Semibold with subtle letter-spacing for distinction
- Interactive elements: Medium weight for clarity

---

### B. Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Micro spacing (within components): p-2, gap-2
- Standard spacing (between elements): p-4, gap-4, m-4
- Section spacing: p-6, py-8
- Major spacing (page margins): p-8, px-12

**Container Structure**:
- Page wrapper: max-w-7xl mx-auto px-6
- Table container: w-full with overflow-x-auto
- Control panels: max-w-md for focused interactions

---

### C. Component Library

#### 1. **Data Table**
- Full-width responsive table with horizontal scroll on smaller screens
- Generous cell padding: px-4 py-3 for comfortable reading
- Clear row separators with subtle borders
- Zebra striping optional (alternating row backgrounds for easier scanning)
- Sticky header on scroll for context retention
- Minimum column widths to prevent text cramping

**Column Specifications**:
- Checkbox column: Fixed width, left-aligned, 60px
- Title: Flexible, min-width 200px, left-aligned
- Place of Origin: 150px, left-aligned
- Artist Display: 180px, left-aligned
- Inscriptions: Flexible, min-width 200px, left-aligned
- Date Start/End: 100px each, right-aligned (numeric data)

#### 2. **Selection Controls**

**Checkbox Styling**:
- Size: 20x20px for easy clicking
- Clear visual states: unchecked, checked, indeterminate (for "select all")
- Accessible touch target: min 44x44px including padding

**Selection Indicator Bar** (appears when rows selected):
- Fixed position at top of table or floating above table
- Displays count: "X rows selected" with clear typography
- Action buttons: "Deselect All", "Custom Selection"
- Elevation: shadow-lg for prominence
- Spacing: px-6 py-4

#### 3. **Custom Selection Overlay Panel**

**Panel Structure**:
- Centered modal overlay with backdrop blur
- Panel size: max-w-md, rounded-lg
- Spacing: p-6
- Clear visual hierarchy

**Panel Contents**:
- Title: "Select Rows" (text-xl font-semibold)
- Description text: "Enter number of rows to select" (text-sm, muted)
- Input field:
  - Full width with border
  - Large padding: px-4 py-3
  - Clear placeholder: "e.g., 50"
  - Number type validation
- Action buttons:
  - Primary: "Submit" (prominent styling)
  - Secondary: "Cancel" (subtle styling)
  - Button spacing: gap-3
  - Full-width on mobile, inline on desktop

#### 4. **Pagination Controls**

**Layout**:
- Positioned below table with py-6 spacing
- Flexbox layout: justify-between for alignment
- Mobile: stack vertically (flex-col) with gap-4
- Desktop: horizontal (flex-row)

**Components**:
- Page info: "Page X of Y" (left side)
- Navigation buttons: Previous/Next with icon indicators
- Optional: Page number selector (1, 2, 3, ..., Last)
- Rows per page selector: Dropdown for user preference
- Button sizing: px-4 py-2, touch-friendly

#### 5. **Loading & Empty States**

**Loading Indicator**:
- Centered spinner/skeleton during fetch
- Full table height placeholder
- Subtle pulsing animation

**Empty State**:
- Centered message when no data
- Icon + text combination
- Clear call-to-action if applicable

#### 6. **Header Section**

**Layout**:
- Full-width container with py-8 spacing
- Title + description layout
- Optional: Search/filter controls in future

**Contents**:
- Application title: "Art Institute of Chicago Collection"
- Subtitle: Brief description of the data table purpose
- Spacing: gap-2 between title and subtitle

---

### D. Interaction Patterns

**Hover States**:
- Table rows: Subtle background change on hover
- Buttons: Slight elevation increase, no transform
- Checkboxes: Border emphasis on hover

**Selection Feedback**:
- Selected rows: Distinct background treatment
- Smooth transitions: transition-colors duration-150
- Clear visual difference between selected/unselected

**Focus States**:
- Keyboard navigation: Clear focus rings on all interactive elements
- Focus ring: ring-2 ring-offset-2 using focus-visible

---

### E. Responsive Behavior

**Breakpoints**:
- Mobile (<768px): Stack controls, full-width buttons, horizontal table scroll
- Tablet (768-1024px): Balanced layout, some controls inline
- Desktop (>1024px): Full horizontal layout, all controls visible

**Table Responsiveness**:
- Always maintain horizontal scroll capability
- Sticky first column (checkbox + title) on mobile for context
- Adjust padding: px-3 py-2 on mobile, px-4 py-3 on desktop

---

### F. Accessibility Requirements

- All interactive elements keyboard accessible
- ARIA labels for icon-only buttons
- Screen reader announcements for selection changes
- Sufficient contrast ratios for all text
- Focus indicators on all interactive elements
- Table semantic HTML with proper headers

---

## Icons

**Library**: Use Heroicons via CDN (outline style for most icons, solid for active states)

**Icon Usage**:
- Pagination arrows: ChevronLeft, ChevronRight
- Custom selection: AdjustmentsHorizontal or Squares2X2
- Close button: XMark
- Loading: ArrowPath (rotating)
- Checkmarks: Check

**Icon Sizing**: w-5 h-5 (20px) for UI elements, w-6 h-6 for prominent actions

---

## Quality Standards

- Pixel-perfect alignment using Tailwind's spacing system
- Consistent component spacing throughout
- Fast, smooth interactions with minimal animation
- Professional, clean aesthetic suitable for data applications
- Thoroughly tested selection persistence logic
- Optimized for performance with large datasets