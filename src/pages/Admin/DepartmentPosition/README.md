# Department & Position Management

This component provides a comprehensive interface for managing departments and positions within the organization.

## Features

- **Department Management**: Create, edit, and manage organizational departments
- **Position Management**: Define and manage job positions and their hierarchy levels
- **Organizational Hierarchy**: Visual representation of the company structure
- **Analytics Dashboard**: Statistics and reports on department and position distribution
- **Employee Integration**: View employees assigned to departments and positions

## Components

- `index.tsx` - Main component with tabbed interface
- `types.ts` - TypeScript interfaces for data structures
- `DepartmentPosition.css` - Styling for the component

## Data Structure

The component manages the following entities:
- **Departments**: Organizational units with hierarchy support
- **Positions**: Job roles with defined levels (1-5)
- **Employees**: Staff members assigned to departments and positions
- **Projects**: Work assignments linked to departments

## Usage

```tsx
import DepartmentPositionPage from './pages/Admin/DepartmentPosition';

// Use in routing
<Route path="/admin/department-position" component={DepartmentPositionPage} />
```

## Tabs

1. **Departments** - Manage organizational departments
2. **Positions** - Manage job positions and levels
3. **Hierarchy** - View organizational structure
4. **Analytics** - Statistics and reports

## Future Enhancements

- Modal forms for adding/editing departments and positions
- Advanced filtering and search capabilities
- Drag-and-drop hierarchy management
- Export functionality for reports
- Integration with external HR systems


