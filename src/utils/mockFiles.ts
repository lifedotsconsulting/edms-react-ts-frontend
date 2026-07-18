export interface MockFile {
  id: number;
  st: string;
  document: string;
  version: string;
  user: string;
  building: string;
  drawing: string;
  title: string;
  sub1: string;
  sub2: string;
  equipment: string;
  status: string;
  lastModified: string;
  fileName: string;
}

export const MOCK_FILES: MockFile[] = [
  { id: 1, st: 'A', document: 'DOC-101', version: 'v1.0', user: 'NJagtap', building: 'B-12', drawing: 'N/A', title: 'Nikhil Jagtap Resume', sub1: 'HR', sub2: 'Resume', equipment: 'N/A', status: 'Approved', lastModified: '2026-06-20', fileName: 'Nikhil_Jagtap_Resume.pdf' },
  { id: 2, st: 'A', document: 'DOC-102', version: 'v1.0', user: 'ANahar', building: 'B-12', drawing: 'N/A', title: 'Abhishek Nahar Resume', sub1: 'HR', sub2: 'Resume', equipment: 'N/A', status: 'Approved', lastModified: '2026-06-21', fileName: 'Resume I Abhishek Nahar.pdf' },
  { id: 3, st: 'A', document: 'DOC-103', version: 'v1.1', user: 'JDoe', building: 'B-01', drawing: 'N/A', title: 'SXR Static Calculations', sub1: 'Engineering', sub2: 'Static Analysis', equipment: 'EQ-044', status: 'Approved', lastModified: '2026-06-22', fileName: 'SXR_Static_11_12_25.pdf' },
  { id: 4, st: 'B', document: 'DOC-104', version: 'v2.0', user: 'MJohnson', building: 'HQ-1', drawing: 'N/A', title: 'ServiceNow Basics Training', sub1: 'IT', sub2: 'Training Manual', equipment: 'N/A', status: 'Approved', lastModified: '2026-06-18', fileName: 'ServiceNow BasicsRf.pdf' },
  { id: 5, st: 'A', document: 'DOC-105', version: 'v1.0', user: 'ASmith', building: 'HQ-1', drawing: 'N/A', title: 'Zywave Symposium Tickets', sub1: 'Admin', sub2: 'Tickets', equipment: 'N/A', status: 'Approved', lastModified: '2026-06-23', fileName: 'Ticket(s)_For_AI-Native_Engineering_Symposium_at_Zywave_2026.pdf' },
  { id: 6, st: 'A', document: 'DWG-201', version: 'v2.4', user: 'RKumar', building: 'B-05', drawing: 'DWG-X92', title: 'Architectural - Scaling & Multileaders', sub1: 'Structure', sub2: 'Floor 1', equipment: 'N/A', status: 'Approved', lastModified: '2026-06-19', fileName: 'architectural_-_annotation_scaling_and_multileaders.dwg' },
  { id: 7, st: 'A', document: 'DWG-202', version: 'v3.0', user: 'RKumar', building: 'B-05', drawing: 'DWG-X93', title: 'Architectural Example - Imperial', sub1: 'Structure', sub2: 'General', equipment: 'N/A', status: 'Approved', lastModified: '2026-06-20', fileName: 'architectural_example-imperial.dwg' },
  { id: 8, st: 'A', document: 'DWG-203', version: 'v1.2', user: 'PLee', building: 'C-02', drawing: 'DWG-Y11', title: 'Blocks and Tables - Metric', sub1: 'Layout', sub2: 'Details', equipment: 'EQ-201', status: 'Approved', lastModified: '2026-06-21', fileName: 'blocks_and_tables_-_metric.dwg' },
  { id: 9, st: 'A', document: 'DWG-204', version: 'v2.1', user: 'JSmith', building: 'Site-A', drawing: 'DWG-C10', title: 'Civil Example - Imperial', sub1: 'Civil', sub2: 'Landscaping', equipment: 'N/A', status: 'Approved', lastModified: '2026-06-22', fileName: 'civil_example-imperial.dwg' },
  { id: 10, st: 'B', document: 'DWG-205', version: 'v1.0', user: 'TBrown', building: 'B-18', drawing: 'DWG-M02', title: 'Mechanical Example - Imperial', sub1: 'Mechanical', sub2: 'Piping', equipment: 'EQ-551', status: 'Draft', lastModified: '2026-06-15', fileName: 'mechanical_example-imperial.dwg' },
  { id: 11, st: 'A', document: 'DWG-206', version: 'v1.1', user: 'TBrown', building: 'B-18', drawing: 'DWG-M03', title: 'Plot Screening & Fill Patterns', sub1: 'Mechanical', sub2: 'Details', equipment: 'EQ-552', status: 'Approved', lastModified: '2026-06-16', fileName: 'plot_screening_and_fill_patterns.dwg' },
  { id: 12, st: 'A', document: 'DWG-207', version: 'v4.2', user: 'OWright', building: 'Condo-X', drawing: 'DWG-V01', title: 'Condominium with Skylight', sub1: 'Rendering', sub2: 'Visualization', equipment: 'N/A', status: 'Approved', lastModified: '2026-06-22', fileName: 'visualization_-_condominium_with_skylight.dwg' },
  { id: 13, st: 'A', document: 'DWG-208', version: 'v3.1', user: 'OWright', building: 'Condo-X', drawing: 'DWG-V02', title: 'Conference Room Layout', sub1: 'Rendering', sub2: 'Visualization', equipment: 'EQ-009', status: 'Approved', lastModified: '2026-06-23', fileName: 'visualization_-_conference_room.dwg' },
  { id: 14, st: 'A', document: 'DWF-301', version: 'v1.0', user: 'PLee', building: 'C-02', drawing: 'DWF-B01', title: 'Blocks and Tables DWF', sub1: 'Layout', sub2: 'Summary', equipment: 'EQ-201', status: 'Approved', lastModified: '2026-06-14', fileName: 'blocks_and_tables.dwf' }
];
