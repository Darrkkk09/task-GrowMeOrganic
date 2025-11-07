# Art Institute of Chicago Artwork Data Table

## Overview
A React + Vite + TypeScript application displaying artwork data from the Art Institute of Chicago API with server-side pagination and persistent row selection.

## Project Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript (strict mode)
- **Build Tool**: Vite
- **UI Library**: PrimeReact DataTable for table component
- **State Management**: TanStack Query for data fetching
- **Styling**: Tailwind CSS + Shadcn UI components
- **Icons**: Lucide React

### Data Schema (`shared/schema.ts`)
```typescript
interface Artwork {
  id: number;
  title: string;
  place_of_origin: string | null;
  artist_display: string | null;
  inscriptions: string | null;
  date_start: number | null;
  date_end: number | null;
}
```

### Key Features Implemented

#### 1. PrimeReact DataTable
- Displays 6 required fields: title, place_of_origin, artist_display, inscriptions, date_start, date_end
- Custom styling integrated with Tailwind design system
- Responsive layout with horizontal scroll
- Zebra striping for better readability

#### 2. Server-Side Pagination
- Fetches 12 rows per page from API
- Only fetches current page data (no pre-fetching)
- Clean pagination controls with Previous/Next buttons
- Page info display

#### 3. Persistent Row Selection Strategy
**CRITICAL IMPLEMENTATION**: Uses a hybrid position + ID tracking strategy with override support:

- **Global State**: 
  - `globalSelectedIds: Set<number>` - All artwork IDs explicitly selected (bulk + individual)
  - `selectRowsUpTo: number` - Position threshold for bulk selection (e.g., 50 = first 50 rows)
  - `bulkRangeIds: Set<number>` - IDs discovered to be within bulk range as pages load
  - `bulkOverrideDeselect: Set<number>` - IDs explicitly deselected despite being in bulk range
  
- **Selection Logic**:
  1. **Individual Selection/Deselection**:
     - Selecting a row: Add ID to `globalSelectedIds`, remove from `bulkOverrideDeselect`
     - Deselecting in bulk range: Add ID to `bulkOverrideDeselect`, remove from `globalSelectedIds`
     - Deselecting outside bulk: Simply remove from `globalSelectedIds`
  
  2. **Page Navigation**:
     - Calculate each row's global position
     - If position ≤ `selectRowsUpTo`, add ID to `bulkRangeIds`
     - Row selected if: (in bulk range AND not overridden) OR explicitly selected
  
  3. **Custom Bulk Selection** (user enters N):
     - Set `selectRowsUpTo = N`
     - Clear `bulkOverrideDeselect` and `bulkRangeIds`
     - Mark current page rows in range by adding to both sets
     - As user visits other pages, rows auto-select based on position
  
  4. **Selection Count**:
     - Formula: `selectRowsUpTo - bulkOverrideDeselect.size + idsOutsideBulk.length`
     - Accurately counts: bulk (minus overrides) + explicit selections outside bulk

**Why This Works**:
- No pre-fetching: IDs discovered lazily as pages load
- Memory efficient: Stores only IDs (numbers), not artwork objects
- Accurate counting: Tracks overrides separately from bulk range
- User can deselect individual rows even in bulk range
- Handles complex scenarios: bulk + individual + overrides all work together

#### 4. Custom Row Selection Overlay
- PrimeReact OverlayPanel component
- Input field for specifying N rows to select
- Validation for positive integers
- Toast notifications for user feedback

### Recent Changes
- **2025-11-04**: Initial implementation with complete MVP features
  - Created Artwork schema with TypeScript interfaces
  - Built Home page with PrimeReact DataTable
  - Implemented persistent selection with Set-based tracking
  - Added custom selection overlay panel
  - Configured design tokens and PrimeReact theme integration

## User Preferences
- Professional, data-focused design
- Clean, minimal UI with good contrast
- Smooth interactions and transitions
- Accessible and keyboard-friendly

## API Integration
- **Endpoint**: `https://api.artic.edu/api/v1/artworks?page={page}&limit={limit}`
- **Method**: GET (client-side fetch)
- **No backend proxy needed**: Direct API calls from frontend

## Testing Checklist
- [ ] Table displays all 6 required fields correctly
- [ ] Pagination fetches only current page data
- [ ] Row selection persists when navigating between pages
- [ ] Custom selection works without pre-fetching other pages
- [ ] Select all on current page works
- [ ] Deselect all clears global selection state
- [ ] Loading and error states display properly
- [ ] Responsive design works on mobile/tablet/desktop
