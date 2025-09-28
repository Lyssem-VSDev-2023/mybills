# Bill Management App - MVP Implementation Plan

## Core Features to Implement:
1. **Bill Types Management** - Create, edit, delete bill categories
2. **Bill Entry Form** - Add new bills with metadata
3. **File Upload System** - Handle PDF and image uploads with logical renaming
4. **Bills Dashboard** - View and manage all bills
5. **Payment Status Tracking** - Mark bills as paid/unpaid
6. **File Organization** - Logical file naming pattern

## Files to Create:

### 1. **src/pages/Index.tsx** - Main dashboard page
- Bills overview with filters
- Quick stats (total bills, paid/unpaid, amounts)
- Navigation to different sections

### 2. **src/components/BillTypeManager.tsx** - Bill types management
- Create new bill types
- Edit/delete existing types
- List all bill types

### 3. **src/components/BillForm.tsx** - Add/edit bill form
- Bill metadata input (amount, period, type, status)
- File upload for bills and receipts
- Form validation

### 4. **src/components/BillsList.tsx** - Bills listing component
- Display all bills in table format
- Filter by type, status, period
- Actions (edit, delete, view files)

### 5. **src/components/FileUpload.tsx** - File upload component
- Handle PDF and image uploads
- Preview uploaded files
- Logical file renaming system

### 6. **src/lib/storage.ts** - Local storage utilities
- Save/load bill data
- File management utilities
- Data persistence

### 7. **src/types/bill.ts** - TypeScript interfaces
- Bill interface
- BillType interface
- Payment status enums

### 8. **src/lib/fileUtils.ts** - File handling utilities
- File renaming logic
- File validation
- File organization helpers

## File Naming Pattern:
`{BillType}_{Period}_{Amount}_{Status}_{Timestamp}.{extension}`
Example: `Electricity_2024-01_150.00_Paid_20240115.pdf`

## Implementation Strategy:
- Use localStorage for data persistence (no backend required)
- File uploads will be stored as base64 in localStorage
- Responsive design with Tailwind CSS
- Form validation with proper error handling
- Clean, intuitive UI using Shadcn components
