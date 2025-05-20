
'use client';

import React from 'react';
import AppLayout from '@/components/layout/app-layout';
import { TreeCanvas } from '@/components/tree/tree-canvas';
import type { TreeNodeData, TreeEdgeData, TreeEdgeType, SpouseEdgeStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { findRelationship } from '@/lib/relationship-finder';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const generateEdgeId = () => `edge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const NODE_WIDTH = 224;
const NODE_HEIGHT = 100; 
const HORIZONTAL_SPACING = 80;
const VERTICAL_SPACING = 100;


const initialNodes: TreeNodeData[] = [
  { id: '1', name: 'John Doe', photoUrl: 'https://placehold.co/80x80.png', gender: 'male', birthDate: '1970-01-01', "data-ai-hint": "man portrait" },
  { id: '2', name: 'Jane Smith (Doe)', photoUrl: 'https://placehold.co/80x80.png', gender: 'female', birthDate: '1972-03-15', "data-ai-hint": "woman portrait", deathDate: '2020-05-10' },
  { id: '3', name: 'Peter Doe', photoUrl: 'https://placehold.co/80x80.png', gender: 'male', birthDate: '1995-06-20', "data-ai-hint": "man portrait" },
  { id: '4', name: 'Alice Doe-Green', photoUrl: 'https://placehold.co/80x80.png', gender: 'female', birthDate: '1998-09-10', "data-ai-hint": "woman portrait" },
  { id: '5', name: 'Charlie Green', photoUrl: 'https://placehold.co/80x80.png', gender: 'male', birthDate: '1997-11-05', "data-ai-hint": "man portrait" },
  { id: '6', name: 'Laura Doe', photoUrl: 'https://placehold.co/80x80.png', gender: 'female', birthDate: '2000-01-01', "data-ai-hint": "woman portrait" },
];

const initialEdges: TreeEdgeData[] = [
  { id: 'e1', sourceId: '1', targetId: '2', type: 'spouse', status: 'divorced' },
  { id: 'e2', sourceId: '1', targetId: '3', type: 'parent-child' },
  { id: 'e3', sourceId: '2', targetId: '3', type: 'parent-child' },
  { id: 'e4', sourceId: '2', targetId: '4', type: 'parent-child' },
  { id: 'e5', sourceId: '1', targetId: '4', type: 'parent-child' }, 
  { id: 'e6', sourceId: '4', targetId: '5', type: 'spouse', status: 'married' },
  { id: 'e7', sourceId: '1', targetId: '6', type: 'parent-child' },
  { id: 'e8', sourceId: '2', targetId: '6', type: 'parent-child' },
];

interface AppliedVisualSettings {
  fontFamily: string;
  showPhotos: boolean;
  customNodeColor: string;
}

export default function HomePage() {
  const [nodes, setNodes] = React.useState<TreeNodeData[]>(initialNodes);
  const [edges, setEdges] = React.useState<TreeEdgeData[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [isAddingMode, setIsAddingMode] = React.useState<boolean>(false);
  
  const { toast } = useToast();

  const [linkingSourceNodeId, setLinkingSourceNodeId] = React.useState<string | null>(null);
  const [linkingMouseCoords, setLinkingMouseCoords] = React.useState<{ x: number; y: number } | null>(null);

  const [isRelationshipTypeDialogOpen, setIsRelationshipTypeDialogOpen] = React.useState<boolean>(false);
  const [pendingLink, setPendingLink] = React.useState<{ sourceId: string; targetId: string } | null>(null);
  const [selectedRelationshipTypeForDialog, setSelectedRelationshipTypeForDialog] = React.useState<TreeEdgeType>('parent-child');
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const [isFindingRelationshipMode, setIsFindingRelationshipMode] = React.useState<boolean>(false);
  const [findRelNode1Id, setFindRelNode1Id] = React.useState<string | null>(null);
  const [findRelNode2Id, setFindRelNode2Id] = React.useState<string | null>(null);
  const [relationshipResult, setRelationshipResult] = React.useState<string | null>(null);
  const [isRelationshipResultDialogOpen, setIsRelationshipResultDialogOpen] = React.useState<boolean>(false);
  
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = React.useState<boolean>(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = React.useState<boolean>(false);


  const [connectorThickness, setConnectorThickness] = React.useState<number>(2);
  const [appliedVisualSettings, setAppliedVisualSettings] = React.useState<AppliedVisualSettings>({
    fontFamily: 'Merriweather',
    showPhotos: true,
    customNodeColor: '#D1D5DB', 
  });

  React.useEffect(() => {
    document.documentElement.style.setProperty('--node-font-family', appliedVisualSettings.fontFamily + ', serif');
    document.documentElement.style.setProperty('--custom-theme-color-node-bg', appliedVisualSettings.customNodeColor);
  }, [appliedVisualSettings.fontFamily, appliedVisualSettings.customNodeColor]);


  React.useEffect(() => {
    if (!selectedNodeId && nodes.length > 0 && !isAddingMode && !linkingSourceNodeId && !isRelationshipTypeDialogOpen && !isFindingRelationshipMode) {
      // setSelectedNodeId(nodes[0].id); // Comment out or adjust initial selection behavior
    }
  }, [nodes, selectedNodeId, isAddingMode, linkingSourceNodeId, isRelationshipTypeDialogOpen, isFindingRelationshipMode]);

  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (linkingSourceNodeId) {
          handleCancelLinking();
        }
        if (isRelationshipTypeDialogOpen) {
          handleCancelRelationshipTypeDialog();
        }
        if (isFindingRelationshipMode) {
          handleCancelFindRelationship();
        }
        if (isSettingsSheetOpen) {
          setIsSettingsSheetOpen(false);
        }
        if (isHelpDialogOpen) {
          setIsHelpDialogOpen(false);
        }
      }
    };
    if (linkingSourceNodeId || isRelationshipTypeDialogOpen || isFindingRelationshipMode || isSettingsSheetOpen || isHelpDialogOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [linkingSourceNodeId, isRelationshipTypeDialogOpen, isFindingRelationshipMode, isSettingsSheetOpen, isHelpDialogOpen]);


  const handleSelectNode = (nodeId: string | null) => {
    if (isFindingRelationshipMode) {
      if (!nodeId) return; 

      if (!findRelNode1Id) {
        setFindRelNode1Id(nodeId);
        setSelectedNodeId(null); 
      } else if (nodeId !== findRelNode1Id && !findRelNode2Id) {
        setFindRelNode2Id(nodeId);
        const result = findRelationship(findRelNode1Id, nodeId, nodes, edges);
        setRelationshipResult(result);
        setIsRelationshipResultDialogOpen(true);
      }
      return;
    }

    if (linkingSourceNodeId && nodeId && linkingSourceNodeId !== nodeId) {
        handleFinalizeLink(nodeId);
    } else if (linkingSourceNodeId && nodeId === linkingSourceNodeId) {
        handleCancelLinking();
    } else if (!isRelationshipTypeDialogOpen) {
        setSelectedNodeId(nodeId);
        setIsAddingMode(false);
        handleCancelLinking();
    }
  };

  const handleInitiateAdd = () => {
    setSelectedNodeId(null);
    setIsAddingMode(true);
    handleCancelLinking();
    handleCancelFindRelationship();
    setIsRelationshipTypeDialogOpen(false);
  };

  const handleCancelAdd = () => {
    setIsAddingMode(false);
    handleCancelLinking();
  }

  const handleSaveNode = (nodeData: Partial<TreeNodeData>, nodeIdToUpdate?: string) => {
    if (isAddingMode && !nodeIdToUpdate) {
      const newNode: TreeNodeData = {
        id: String(Date.now()),
        name: nodeData.name || 'Unnamed Person',
        x: nodeData.x || Math.random() * (canvasRef.current?.clientWidth || 800) * 0.8 + 50,
        y: nodeData.y || Math.random() * (canvasRef.current?.clientHeight || 600) * 0.8 + 50,
        gender: nodeData.gender || 'unknown',
        photoUrl: nodeData.photoUrl || `https://placehold.co/80x80.png`,
        "data-ai-hint": nodeData.photoUrl && !nodeData.photoUrl.startsWith('https://placehold.co') ? 'person custom' : (nodeData.gender === 'female' ? 'woman portrait' : (nodeData.gender === 'male' ? 'man portrait' : 'person portrait')),
        birthDate: nodeData.birthDate,
        deathDate: nodeData.deathDate,
        notes: nodeData.notes,
      };
      setNodes(prev => {
        const newNodesList = [...prev, newNode];
        return newNodesList;
      });
      setSelectedNodeId(newNode.id);
      toast({ title: "Person Added", description: `${newNode.name} has been added to the tree.` });
      setIsAddingMode(false);
    } else {
      const idToUse = nodeIdToUpdate || selectedNodeId;
      if (idToUse) {
        setNodes(prev => prev.map(n => n.id === idToUse ? { ...n, ...nodeData, id: n.id } : n));
        toast({ title: "Changes Saved", description: `Details for ${nodeData.name || 'Person'} have been updated.` });
        if (isAddingMode) setIsAddingMode(false);
      }
    }
    handleCancelLinking();
    handleCancelFindRelationship();
  };


  const handleDeleteNode = (nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(edge => edge.sourceId !== nodeId && edge.targetId !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(nodes.length > 1 ? nodes.filter(n=>n.id !== nodeId)[0].id : null);
    }
    setIsAddingMode(false);
    handleCancelLinking();
    handleCancelFindRelationship();
    toast({ title: "Person Deleted", description: `${nodeToDelete?.name || 'Person'} has been removed from the tree.`, variant: 'destructive' });
  };

  const handleNodePositionChange = (nodeId: string, x: number, y: number) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId ? { ...node, x, y } : node
      )
    );
  };

  const handleAddEdge = (sourceId: string, targetId: string, type: TreeEdgeType) => {
    if (sourceId === targetId) {
      toast({ title: "Invalid Relationship", description: "Cannot create a relationship with oneself.", variant: "destructive" });
      return;
    }
    const existingEdge = edges.find(edge =>
      (edge.sourceId === sourceId && edge.targetId === targetId && edge.type === type) ||
      (type === 'spouse' && edge.sourceId === targetId && edge.targetId === sourceId && edge.type === type) ||
      (edge.sourceId === targetId && edge.targetId === sourceId && edge.type === type && type !== 'parent-child')
    );
    if (existingEdge) {
      toast({ title: "Relationship Exists", description: "This relationship already exists.", variant: "destructive" });
      return;
    }

    const newEdge: TreeEdgeData = {
      id: generateEdgeId(),
      sourceId,
      targetId,
      type,
      status: type === 'spouse' ? 'married' : undefined,
    };
    setEdges(prev => [...prev, newEdge]);
    const sourceNodeName = nodes.find(n => n.id === sourceId)?.name || 'Person';
    const targetNodeName = nodes.find(n => n.id === targetId)?.name || 'Person';
    toast({ title: "Relationship Added", description: `Connected ${sourceNodeName} and ${targetNodeName} as ${type}.` });
  };

  const handleRemoveEdge = (edgeId: string) => {
    const edgeToRemove = edges.find(e => e.id === edgeId);
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    if (edgeToRemove) {
        const sourceNode = nodes.find(n => n.id === edgeToRemove.sourceId)?.name || 'Person';
        const targetNode = nodes.find(n => n.id === edgeToRemove.targetId)?.name || 'Person';
        toast({ title: "Relationship Removed", description: `Disconnected ${sourceNode} and ${targetNode}.`, variant: 'destructive' });
    }
  };

  const handleUpdateEdgeStatus = (edgeId: string, newStatus: SpouseEdgeStatus) => {
    setEdges(prevEdges =>
      prevEdges.map(edge =>
        edge.id === edgeId ? { ...edge, status: newStatus } : edge
      )
    );
    const edge = edges.find(e => e.id === edgeId);
    if (edge) {
        const sourceNode = nodes.find(n => n.id === edge.sourceId)?.name || 'Person';
        const targetNode = nodes.find(n => n.id === edge.targetId)?.name || 'Person';
        toast({ title: "Relationship Updated", description: `Relationship status between ${sourceNode} and ${targetNode} changed to ${newStatus}.` });
    }
  };

  const handleExportJSON = () => {
    const data = { nodes, edges };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `family-tree-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Export Successful", description: "Family tree data exported as JSON." });
  };

  const handleImportJSON = (fileContent: string) => {
    try {
      const data = JSON.parse(fileContent);
      if (data.nodes && Array.isArray(data.nodes) && data.edges && Array.isArray(data.edges)) {
        const sanitizedNodes = data.nodes.map((node: TreeNodeData) => ({
          ...node,
          x: typeof node.x === 'number' ? node.x : Math.random() * (canvasRef.current?.clientWidth || 800) * 0.8 + 50,
          y: typeof node.y === 'number' ? node.y : Math.random() * (canvasRef.current?.clientHeight || 600) * 0.8 + 50,
        }));
        setNodes(sanitizedNodes);
        setEdges(data.edges);
        setSelectedNodeId(sanitizedNodes.length > 0 ? sanitizedNodes[0].id : null);
        setIsAddingMode(false);
        handleCancelLinking();
        handleCancelFindRelationship();
        toast({ title: "Import Successful", description: "Family tree data imported." });
      } else {
        throw new Error("Invalid JSON structure for family tree data.");
      }
    } catch (error) {
      console.error("Import error:", error);
      const message = error instanceof Error ? error.message : "Unknown error during import.";
      toast({ title: "Import Failed", description: `Could not import JSON data. ${message}`, variant: "destructive" });
    }
  };

  const handleNewTree = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setIsAddingMode(false);
    setLinkingSourceNodeId(null);
    setLinkingMouseCoords(null);
    setIsRelationshipTypeDialogOpen(false);
    setPendingLink(null);
    handleCancelFindRelationship();
    toast({ title: "New Tree Created", description: "The canvas is cleared. Start adding people!" });
  };

  const handleInitiateLinking = (nodeId: string) => {
    setLinkingSourceNodeId(nodeId);
    setSelectedNodeId(null);
    setIsAddingMode(false);
    setLinkingMouseCoords(null);
    setIsRelationshipTypeDialogOpen(false);
    handleCancelFindRelationship();
  };

  const handleUpdateLinkingCoords = (coords: { x: number; y: number } | null) => {
    if (linkingSourceNodeId) {
      setLinkingMouseCoords(coords);
    }
  };

  const handleFinalizeLink = (targetNodeId: string) => {
    if (linkingSourceNodeId && linkingSourceNodeId !== targetNodeId) {
      setPendingLink({ sourceId: linkingSourceNodeId, targetId: targetNodeId });
      setSelectedRelationshipTypeForDialog('parent-child');
      setIsRelationshipTypeDialogOpen(true);
    }
    setLinkingSourceNodeId(null);
    setLinkingMouseCoords(null);
  };

  const handleCancelLinking = () => {
    setLinkingSourceNodeId(null);
    setLinkingMouseCoords(null);
  };

  const handleConfirmRelationshipType = () => {
    if (pendingLink) {
      handleAddEdge(pendingLink.sourceId, pendingLink.targetId, selectedRelationshipTypeForDialog);
    }
    setIsRelationshipTypeDialogOpen(false);
    setPendingLink(null);
  };

  const handleCancelRelationshipTypeDialog = () => {
    setIsRelationshipTypeDialogOpen(false);
    setPendingLink(null);
  };

  const handleAutoArrangeNodes = React.useCallback(() => {
    if (nodes.length === 0) return;

    const canvasEl = canvasRef.current;
    if (!canvasEl) {
        toast({ title: "Arrange Error", description: "Canvas not ready. Please try again.", variant: "destructive" });
        return;
    }

    const nodeMap = new Map(nodes.map(n => [n.id, { ...n }]));
    const adj: Record<string, { children: string[], spouses: string[], parents: string[] }> = {};
    nodes.forEach(n => adj[n.id] = { children: [], spouses: [], parents: [] });

    edges.forEach(edge => {
      if (!nodeMap.has(edge.sourceId) || !nodeMap.has(edge.targetId)) return; 
      if (edge.type === 'parent-child') {
        adj[edge.sourceId]?.children.push(edge.targetId);
        adj[edge.targetId]?.parents.push(edge.sourceId);
      } else if (edge.type === 'spouse') {
        adj[edge.sourceId]?.spouses.push(edge.targetId);
        adj[edge.targetId]?.spouses.push(edge.sourceId);
      }
    });

    const positions: Record<string, { x: number, y: number, layer: number }> = {};
    const layerNodes: Record<number, string[]> = {};
    let maxLayer = 0;

    const roots = nodes.filter(n => {
      const parentIds = adj[n.id]?.parents || [];
      return parentIds.length === 0 || parentIds.every(pId => !nodeMap.has(pId));
    });

    const queue: { nodeId: string, layer: number }[] = roots.map(r => ({ nodeId: r.id, layer: 0 }));
    const visitedForLayering = new Set<string>();

    // Phase 1: BFS for initial layering
    while (queue.length > 0) {
      const { nodeId, layer } = queue.shift()!;
      
      if (visitedForLayering.has(nodeId) && positions[nodeId]?.layer !== undefined && layer <= positions[nodeId].layer ) {
          continue;
      }
    
      if (positions[nodeId]?.layer !== undefined && positions[nodeId].layer !== layer && layerNodes[positions[nodeId].layer]) {
          layerNodes[positions[nodeId].layer] = layerNodes[positions[nodeId].layer].filter(id => id !== nodeId);
      }
    
      positions[nodeId] = { ...positions[nodeId], y: layer * (NODE_HEIGHT + VERTICAL_SPACING) + 50, layer };
      if (!layerNodes[layer]) layerNodes[layer] = [];
      if (!layerNodes[layer].includes(nodeId)) layerNodes[layer].push(nodeId);
    
      visitedForLayering.add(nodeId);
      maxLayer = Math.max(maxLayer, layer);
    
      (adj[nodeId]?.children || []).forEach(childId => {
        if (nodeMap.has(childId)) { 
            queue.push({ nodeId: childId, layer: layer + 1 });
        }
      });
    
      (adj[nodeId]?.spouses || []).forEach(spouseId => {
         if (nodeMap.has(spouseId) && (!visitedForLayering.has(spouseId) || (positions[spouseId]?.layer !== undefined && layer < positions[spouseId].layer))) { 
             queue.push({nodeId: spouseId, layer: layer}); 
         } else if (nodeMap.has(spouseId) && (!positions[spouseId] || positions[spouseId].layer === undefined)) {
             queue.push({nodeId: spouseId, layer: layer});
         }
      });
    }

    // Phase 2: Spouse Layer Synchronization (Iterative)
    let changedInSpouseSyncIteration;
    for (let iter = 0; iter < nodes.length; iter++) { 
        changedInSpouseSyncIteration = false;
        edges.forEach(edge => {
            if (edge.type === 'spouse') {
                const sourceId = edge.sourceId;
                const targetId = edge.targetId;

                if (!nodeMap.has(sourceId) || !nodeMap.has(targetId)) return; 
                if (!positions[sourceId] || positions[sourceId].layer === undefined ||
                    !positions[targetId] || positions[targetId].layer === undefined) return;

                const sourceNodeInfo = positions[sourceId];
                const targetNodeInfo = positions[targetId];

                if (sourceNodeInfo.layer !== targetNodeInfo.layer) {
                    const deeperLayer = Math.max(sourceNodeInfo.layer, targetNodeInfo.layer);

                    const adjustNodeLayer = (nodeIdToAdjust: string, currentActualLayer: number, newLayer: number) => {
                        if (currentActualLayer !== newLayer) {
                            if (layerNodes[currentActualLayer]) {
                                layerNodes[currentActualLayer] = layerNodes[currentActualLayer].filter(id => id !== nodeIdToAdjust);
                            }
                            positions[nodeIdToAdjust].layer = newLayer;
                            positions[nodeIdToAdjust].y = newLayer * (NODE_HEIGHT + VERTICAL_SPACING) + 50;
                            if (!layerNodes[newLayer]) layerNodes[newLayer] = [];
                            if (!layerNodes[newLayer].includes(nodeIdToAdjust)) layerNodes[newLayer].push(nodeIdToAdjust);
                            changedInSpouseSyncIteration = true;
                            maxLayer = Math.max(maxLayer, newLayer); 
                        }
                    };

                    adjustNodeLayer(sourceId, sourceNodeInfo.layer, deeperLayer);
                    adjustNodeLayer(targetId, targetNodeInfo.layer, deeperLayer);
                }
            }
        });
        if (!changedInSpouseSyncIteration) break; 
    }

    // Phase 3: Handle nodes not reached by BFS (orphans or separate fragments)
    nodes.forEach(node => {
        if (!positions[node.id] || positions[node.id].layer === undefined) { 
            const defaultLayer = roots.length > 0 ? maxLayer + 1 : 0; 
            positions[node.id] = { ...positions[node.id], y: defaultLayer * (NODE_HEIGHT + VERTICAL_SPACING) + 50, layer: defaultLayer };
            if (!layerNodes[defaultLayer]) layerNodes[defaultLayer] = [];
            if(!layerNodes[defaultLayer].includes(node.id)) layerNodes[defaultLayer].push(node.id);
            maxLayer = Math.max(maxLayer, defaultLayer);
        }
    });
    
    let finalMaxLayer = 0;
    Object.keys(layerNodes).forEach(layerKey => {
        const layerIndex = parseInt(layerKey, 10);
        if (layerNodes[layerIndex] && layerNodes[layerIndex].length > 0) {
             finalMaxLayer = Math.max(finalMaxLayer, layerIndex);
        }
    });
    maxLayer = finalMaxLayer;


    // Phase 4: Horizontal Positioning (X-coordinates)
    const canvasWidth = canvasEl.clientWidth || (typeof window !== 'undefined' ? window.innerWidth * 0.7 : 800); 

    for (let l = 0; l <= maxLayer; l++) {
      const currentLayerNodeIds = layerNodes[l] || [];
      if (currentLayerNodeIds.length === 0) continue;

      const processedInLayer = new Set<string>();
      const layerElements: {id: string, width: number, actualIds: string[]}[] = []; 

      currentLayerNodeIds.forEach(nodeId => {
          if (processedInLayer.has(nodeId) || !nodeMap.has(nodeId)) return;

          const elementGroup = [nodeId]; 
          processedInLayer.add(nodeId);

          const spousesInSameLayer = (adj[nodeId]?.spouses || []).filter(
              sId => nodeMap.has(sId) && positions[sId]?.layer === l && !processedInLayer.has(sId)
          );

          spousesInSameLayer.forEach(sId => {
              elementGroup.push(sId);
              processedInLayer.add(sId);
          });
          
          elementGroup.sort((a, b) => (positions[a]?.x || 0) - (positions[b]?.x || 0) || a.localeCompare(b));


          layerElements.push({
              id: elementGroup[0], 
              width: elementGroup.length * NODE_WIDTH + (elementGroup.length > 1 ? (elementGroup.length - 1) * (HORIZONTAL_SPACING / 4) : 0), 
              actualIds: elementGroup
          });
      });
      
      layerElements.sort((a,b) => (positions[a.id]?.x || 0) - (positions[b.id]?.x || 0) || a.id.localeCompare(b.id));


      const layerWidth = layerElements.reduce((sum, el) => sum + el.width, 0) + (layerElements.length > 1 ? (layerElements.length - 1) * HORIZONTAL_SPACING : 0);
      
      let currentX = Math.max(50, (canvasWidth - layerWidth) / 2); 

      layerElements.forEach(element => {
          let subElementX = currentX;
          element.actualIds.forEach((idInElement, index) => {
              if (positions[idInElement]) { 
                  positions[idInElement].x = subElementX;
              }
              subElementX += NODE_WIDTH + (index < element.actualIds.length -1 ? (HORIZONTAL_SPACING / 4) : 0) ; 
          });
          currentX += element.width + HORIZONTAL_SPACING; 
      });
    }

    const newNodes = nodes.map(n => {
      if (positions[n.id] && positions[n.id].layer !== undefined) { 
        return { ...n, x: positions[n.id].x, y: positions[n.id].y };
      }
      return { ...n, x: n.x || Math.random() * canvasWidth * 0.8 + 50, y: n.y || Math.random() * (NODE_HEIGHT + VERTICAL_SPACING) * (maxLayer +1) * 0.8 + 50 };
    });

    setNodes(newNodes);
    toast({ title: "Tree Rearranged", description: "Nodes have been automatically arranged." });
  }, [nodes, edges, toast, setNodes, canvasRef]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (nodes.length > 0 && canvasRef.current) {
        handleAutoArrangeNodes();
      }
    }, 100); 

    return () => clearTimeout(timer);
  }, []); // Empty dependency array to run once on mount


  const nodeForDetailsPanel = React.useMemo(() => {
    if (isAddingMode || linkingSourceNodeId || isRelationshipTypeDialogOpen || isFindingRelationshipMode) return null;
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes, isAddingMode, linkingSourceNodeId, isRelationshipTypeDialogOpen, isFindingRelationshipMode]);

  const pendingLinkSourceNodeName = pendingLink ? nodes.find(n => n.id === pendingLink.sourceId)?.name : 'Person A';
  const pendingLinkTargetNodeName = pendingLink ? nodes.find(n => n.id === pendingLink.targetId)?.name : 'Person B';

  const findRelNode1Name = findRelNode1Id ? nodes.find(n => n.id === findRelNode1Id)?.name : null;

  const handleExportPNG = async () => {
    if (!canvasRef.current) {
      toast({ title: "Export Error", description: "Canvas not ready.", variant: "destructive" });
      return;
    }
    try {
      const canvasImage = await html2canvas(canvasRef.current, {
        backgroundColor: null, 
        useCORS: true, 
        logging: true, 
      });
      const dataUrl = canvasImage.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `family-tree-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: "PNG Exported", description: "Family tree exported as PNG." });
    } catch (error) {
      console.error("Error exporting PNG:", error);
      toast({ title: "Export Error", description: "Could not export as PNG.", variant: "destructive" });
    }
  };

  const handleExportPDF = async () => {
    if (!canvasRef.current) {
      toast({ title: "Export Error", description: "Canvas not ready.", variant: "destructive" });
      return;
    }
    try {
      const canvasImage = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        useCORS: true,
        logging: true,
        scale: 2, 
      });
      const imgData = canvasImage.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: canvasImage.width > canvasImage.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvasImage.width, canvasImage.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvasImage.width, canvasImage.height);
      pdf.save(`family-tree-${Date.now()}.pdf`);
      toast({ title: "PDF Exported", description: "Family tree exported as PDF." });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({ title: "Export Error", description: "Could not export as PDF.", variant: "destructive" });
    }
  };


  const handleInitiateFindRelationship = () => {
    setIsFindingRelationshipMode(true);
    setFindRelNode1Id(null);
    setFindRelNode2Id(null);
    setRelationshipResult(null);
    setSelectedNodeId(null); 
    setIsAddingMode(false);
    handleCancelLinking();
    toast({ title: "Find Relationship Mode", description: "Select the first person on the canvas." });
  };

  const handleCancelFindRelationship = () => {
    setIsFindingRelationshipMode(false);
    setFindRelNode1Id(null);
    setFindRelNode2Id(null);
    setRelationshipResult(null);
  };

  const handleApplyVisualCustomizations = (settings: AppliedVisualSettings) => {
    setAppliedVisualSettings(settings);
  };

  const handleToggleHelpDialog = () => {
    setIsHelpDialogOpen(prev => !prev);
  };

  return (
    <>
      <AppLayout
        nodes={nodes}
        edges={edges}
        nodeForDetailsPanel={nodeForDetailsPanel}
        isAddingMode={isAddingMode}
        isRelationshipTypeDialogOpen={isRelationshipTypeDialogOpen}
        onInitiateAdd={handleInitiateAdd}
        onCancelAdd={handleCancelAdd}
        onSaveNode={handleSaveNode}
        onDeleteNode={handleDeleteNode}
        onAddEdge={handleAddEdge}
        onRemoveEdge={handleRemoveEdge}
        onUpdateEdgeStatus={handleUpdateEdgeStatus}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onNewTree={handleNewTree}
        
        linkingSourceNodeId={linkingSourceNodeId}
        onCancelLinking={handleCancelLinking}
        
        isFindingRelationshipMode={isFindingRelationshipMode}
        findRelNode1Id={findRelNode1Id}
        findRelNode1Name={findRelNode1Name}
        onInitiateFindRelationship={handleInitiateFindRelationship}
        onCancelFindRelationship={handleCancelFindRelationship}
        
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        
        isSettingsSheetOpen={isSettingsSheetOpen}
        onToggleSettingsSheet={() => setIsSettingsSheetOpen(!isSettingsSheetOpen)}
        
        isHelpDialogOpen={isHelpDialogOpen}
        onToggleHelpDialog={handleToggleHelpDialog}
        
        connectorThickness={connectorThickness}
        onConnectorThicknessChange={setConnectorThickness}
        appliedVisualSettings={appliedVisualSettings}
        onApplyVisualCustomizations={handleApplyVisualCustomizations}
        onAutoArrangeNodes={handleAutoArrangeNodes}
      >
        <TreeCanvas
          canvasRef={canvasRef}
          nodes={nodes}
          edges={edges}
          onNodeSelect={handleSelectNode}
          selectedNodeId={selectedNodeId}
          onNodePositionChange={handleNodePositionChange}
          connectorThickness={connectorThickness}
          linkingSourceNodeId={linkingSourceNodeId}
          linkingMouseCoords={linkingMouseCoords}
          onInitiateLinking={handleInitiateLinking}
          onUpdateLinkingCoords={handleUpdateLinkingCoords}
          onFinalizeLink={handleFinalizeLink}
          onCancelLinking={handleCancelLinking}
          onAutoArrangeNodes={handleAutoArrangeNodes}
          onInitiateAdd={handleInitiateAdd}
          isFindingRelationshipMode={isFindingRelationshipMode}
          findRelNode1Id={findRelNode1Id}
          showNodePhotos={appliedVisualSettings.showPhotos}
        />
      </AppLayout>

      <Dialog open={isRelationshipTypeDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) handleCancelRelationshipTypeDialog();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Define Relationship</DialogTitle>
            <DialogDescription>
              How are {pendingLinkSourceNodeName} and {pendingLinkTargetNodeName} related?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={selectedRelationshipTypeForDialog}
              onValueChange={(value) => setSelectedRelationshipTypeForDialog(value as TreeEdgeType)}
              className="space-y-2"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parent-child" id="rel-parent-child" />
                  <Label htmlFor="rel-parent-child">Parent-Child</Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {pendingLinkSourceNodeName} will be the parent of {pendingLinkTargetNodeName}.
                </p>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spouse" id="rel-spouse" />
                  <Label htmlFor="rel-spouse">Spouse</Label>
                </div>
                 <p className="text-sm text-muted-foreground ml-6">
                  {pendingLinkSourceNodeName} and {pendingLinkTargetNodeName} will be spouses.
                </p>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRelationshipTypeDialog}>Cancel</Button>
            <Button onClick={handleConfirmRelationshipType}>Confirm Relationship</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRelationshipResultDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
            setIsRelationshipResultDialogOpen(false);
            handleCancelFindRelationship(); 
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Relationship Finder Result</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {relationshipResult ? (
                <p>{relationshipResult}</p>
            ) : (
                <p>Calculating relationship...</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => {
                setIsRelationshipResultDialogOpen(false);
                handleCancelFindRelationship();
            }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

