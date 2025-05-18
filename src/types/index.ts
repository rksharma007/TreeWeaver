
export type TreeNodeData = {
  id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  photoUrl?: string;
  notes?: string;
  x?: number;
  y?: number;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  "data-ai-hint"?: string; // Added to allow explicit hints
};

export type TreeEdgeType = 'parent-child' | 'spouse';

export type SpouseEdgeStatus = 'married' | 'divorced'; // More statuses can be added later

export type TreeEdgeData = {
  id:string; // Unique ID for the edge
  sourceId: string; // ID of the source node
  targetId: string; // ID of the target node
  type: TreeEdgeType;
  status?: SpouseEdgeStatus; // Optional status, primarily for spouse edges
};

export type FamilyTreeSettings = {
  themeColor: string; // Main color for nodes/accents
  fontFamily: string;
  nodeShape: 'rectangle' | 'circle' | 'ellipse';
  layoutDirection: 'TB' | 'LR'; // Top-to-Bottom or Left-to-Right
  showPhotos: boolean;
  // Add more customization options as needed
};

export type FamilyTree = {
  id: string;
  name: string;
  nodes: TreeNodeData[];
  edges: TreeEdgeData[];
  settings: FamilyTreeSettings;
  lastModified: string;
};

// Example of a selected node for editing
export type SelectedNode = TreeNodeData | null;

// For the relationship management dialog
export type RelationshipDialogState = {
  open: boolean;
  type: TreeEdgeType | null;
  mode: 'parent' | 'child' | 'spouse' | null; // To clarify which relationship is being added
}
