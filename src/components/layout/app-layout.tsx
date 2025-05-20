
import React from 'react';
import SiteHeader from '@/components/layout/site-header';
import { NodeDetailsPanel } from '@/components/tree/node-details-panel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog } from 'lucide-react';
import type { TreeNodeData, TreeEdgeData, TreeEdgeType, SpouseEdgeStatus } from '@/types';

interface AppliedVisualSettings {
  fontFamily: string;
  showPhotos: boolean;
  customNodeColor: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  nodes: TreeNodeData[];
  edges: TreeEdgeData[];
  nodeForDetailsPanel: TreeNodeData | null;
  isAddingMode: boolean;
  isRelationshipTypeDialogOpen: boolean;
  onInitiateAdd: () => void;
  onCancelAdd: () => void;
  onSaveNode: (nodeData: Partial<TreeNodeData>, nodeIdToUpdate?: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddEdge: (sourceId: string, targetId: string, type: TreeEdgeType) => void;
  onRemoveEdge: (edgeId: string) => void;
  onUpdateEdgeStatus: (edgeId: string, newStatus: SpouseEdgeStatus) => void;
  onExportJSON: () => void;
  onImportJSON: (fileContent: string) => void;
  onNewTree: () => void;
  
  linkingSourceNodeId: string | null;
  onCancelLinking: () => void;
  
  isFindingRelationshipMode: boolean;
  findRelNode1Id: string | null;
  findRelNode1Name: string | null;
  onInitiateFindRelationship: () => void;
  onCancelFindRelationship: () => void;
  
  onExportPNG: () => void; 
  onExportPDF: () => void;
  
  isSettingsSheetOpen: boolean;
  onToggleSettingsSheet: () => void;

  isHelpDialogOpen: boolean;
  onToggleHelpDialog: () => void;

  // Visual Customization Props
  connectorThickness: number;
  onConnectorThicknessChange: (thickness: number) => void;
  appliedVisualSettings: AppliedVisualSettings;
  onApplyVisualCustomizations: (settings: AppliedVisualSettings) => void;
  onAutoArrangeNodes: () => void; 
}

export default function AppLayout({
  children,
  nodes,
  edges,
  nodeForDetailsPanel,
  isAddingMode,
  isRelationshipTypeDialogOpen,
  onInitiateAdd, 
  onCancelAdd,
  onSaveNode,
  onDeleteNode,
  onAddEdge,
  onRemoveEdge,
  onUpdateEdgeStatus,
  onExportJSON,
  onImportJSON,
  onNewTree,
  linkingSourceNodeId,
  onCancelLinking,
  isFindingRelationshipMode,
  findRelNode1Id,
  findRelNode1Name,
  onInitiateFindRelationship,
  onCancelFindRelationship,
  onExportPNG,
  onExportPDF,
  isSettingsSheetOpen,
  onToggleSettingsSheet,
  isHelpDialogOpen,
  onToggleHelpDialog,
  connectorThickness,
  onConnectorThicknessChange,
  appliedVisualSettings,
  onApplyVisualCustomizations,
  onAutoArrangeNodes,
}: AppLayoutProps) {

  const showSpecialMessageInDetailsTab = !!linkingSourceNodeId || isRelationshipTypeDialogOpen || isFindingRelationshipMode;
  let specialMessage = "";
  if (linkingSourceNodeId) specialMessage = "Linking nodes... Finish or cancel to enable details.";
  else if (isRelationshipTypeDialogOpen) specialMessage = "Defining relationship... Please complete the dialog.";
  else if (isFindingRelationshipMode) specialMessage = "Finding relationship... Select nodes on canvas or cancel.";


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader
        onExportJSON={onExportJSON}
        onImportJSON={onImportJSON}
        onNewTree={onNewTree}
        onExportPNG={onExportPNG}
        onExportPDF={onExportPDF}
        isSettingsSheetOpen={isSettingsSheetOpen}
        onToggleSettingsSheet={onToggleSettingsSheet}
        isHelpDialogOpen={isHelpDialogOpen}
        onToggleHelpDialog={onToggleHelpDialog}
        // Pass props for CustomizationPanel (now in Settings Sheet)
        connectorThickness={connectorThickness}
        onConnectorThicknessChange={onConnectorThicknessChange}
        isFindingRelationshipMode={isFindingRelationshipMode}
        findRelNode1Id={findRelNode1Id}
        findRelNode1Name={findRelNode1Name}
        onInitiateFindRelationship={onInitiateFindRelationship}
        onCancelFindRelationship={onCancelFindRelationship}
        // Pass visual settings props
        appliedVisualSettings={appliedVisualSettings}
        onApplyVisualCustomizations={onApplyVisualCustomizations}
      />
      <div className="flex flex-1 overflow-hidden pt-4 px-4 pb-4 gap-4">
        <main className="flex-1 overflow-auto bg-card rounded-lg shadow-lg">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              // @ts-ignore - Assume child is TreeCanvas and accepts these props
              return React.cloneElement(child, { 
                onCancelLinking, 
                onAutoArrangeNodes, 
                isFindingRelationshipMode, 
                findRelNode1Id,
                onInitiateAdd,
                showNodePhotos: appliedVisualSettings.showPhotos, 
              });
            }
            return child;
          })}
        </main>

        <aside className="w-[340px] lg:w-[380px] flex-shrink-0">
          <Card className="h-full shadow-lg flex flex-col">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-lg flex items-center">
                <UserCog className="mr-2 h-5 w-5 text-primary" />
                Node Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                 <div className="p-4">
                    {showSpecialMessageInDetailsTab ? (
                      <div className="text-center text-muted-foreground p-4">
                        {specialMessage}
                      </div>
                    ) : (
                      <NodeDetailsPanel
                        allNodes={nodes}
                        allEdges={edges}
                        currentNode={nodeForDetailsPanel}
                        isAddingMode={isAddingMode}
                        onInitiateAdd={onInitiateAdd} 
                        onCancel={onCancelAdd}
                        onSave={onSaveNode}
                        onDelete={onDeleteNode}
                        onAddEdge={onAddEdge}
                        onRemoveEdge={onRemoveEdge}
                        onUpdateEdgeStatus={onUpdateEdgeStatus}
                      />
                    )}
                  </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
