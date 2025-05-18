
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link2Icon, LayoutGrid, UserPlus } from 'lucide-react';
import Image from 'next/image';
import type { TreeNodeData, TreeEdgeData, TreeEdgeType } from '@/types';
import { cn } from '@/lib/utils';

interface TreeCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  nodes: TreeNodeData[];
  edges: TreeEdgeData[];
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId?: string | null;
  onNodePositionChange: (nodeId: string, x: number, y: number) => void;
  connectorThickness: number;

  linkingSourceNodeId: string | null;
  linkingMouseCoords: { x: number; y: number } | null;
  onInitiateLinking: (nodeId: string) => void;
  onUpdateLinkingCoords: (coords: { x: number; y: number } | null) => void;
  onFinalizeLink: (targetNodeId: string) => void;
  onCancelLinking: () => void;
  onAutoArrangeNodes: () => void;
  onInitiateAdd: () => void; 

  isFindingRelationshipMode?: boolean;
  findRelNode1Id?: string | null;
  showNodePhotos: boolean;
}

const NODE_WIDTH = 224;
const NODE_HEIGHT = 100;
const VERTICAL_ELBOW_OFFSET = 30;

export function TreeCanvas({
  canvasRef,
  nodes,
  edges,
  onNodeSelect,
  selectedNodeId,
  onNodePositionChange,
  connectorThickness,
  linkingSourceNodeId,
  linkingMouseCoords,
  onInitiateLinking,
  onUpdateLinkingCoords,
  onFinalizeLink,
  onCancelLinking,
  onAutoArrangeNodes,
  onInitiateAdd,
  isFindingRelationshipMode,
  findRelNode1Id,
  showNodePhotos,
}: TreeCanvasProps) {

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeId: string) => {
    if (linkingSourceNodeId || isFindingRelationshipMode) {
      event.preventDefault();
      return;
    }
    const nodeElement = event.target as HTMLDivElement;
    const cardElement = nodeElement.closest('[data-node-id]');
    if (!cardElement) return;

    const rect = cardElement.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    event.dataTransfer.setData('application/json', JSON.stringify({
      nodeId,
      offsetX,
      offsetY
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!canvasRef.current) return;

    const droppedData = JSON.parse(event.dataTransfer.getData('application/json'));
    const { nodeId, offsetX, offsetY } = droppedData;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    let newX = event.clientX - canvasRect.left - offsetX;
    let newY = event.clientY - canvasRect.top - offsetY;

    onNodePositionChange(nodeId, newX, newY);
  };

  const handleNodeCardClick = (event: React.MouseEvent<HTMLDivElement>, nodeId: string) => {
     if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    if (isFindingRelationshipMode) {
      onNodeSelect(nodeId);
      return;
    }
    if (linkingSourceNodeId) {
      if (nodeId !== linkingSourceNodeId) {
        onFinalizeLink(nodeId);
      } else {
        onCancelLinking(); 
      }
    } else {
      onNodeSelect(nodeId);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === canvasRef.current) {
      if (isFindingRelationshipMode) {
        onNodeSelect(null); 
        return;
      }
      if (linkingSourceNodeId) {
        onCancelLinking();
      } else {
        onNodeSelect(null);
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (linkingSourceNodeId && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      onUpdateLinkingCoords({
        x: event.clientX - canvasRect.left,
        y: event.clientY - canvasRect.top,
      });
    }
  };

  const getNodeCenter = (node: TreeNodeData, side: 'top' | 'bottom' | 'left' | 'right' | 'center') => {
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    switch (side) {
      case 'top': return { x: x + NODE_WIDTH / 2, y: y };
      case 'bottom': return { x: x + NODE_WIDTH / 2, y: y + NODE_HEIGHT };
      case 'left': return { x: x, y: y + NODE_HEIGHT / 2 };
      case 'right': return { x: x + NODE_WIDTH, y: y + NODE_HEIGHT / 2 };
      case 'center': default: return {x: x + NODE_WIDTH/2, y: y + NODE_HEIGHT/2 };
    }
  };

  const getConnectorStrokeColor = (type: TreeEdgeType | 'child-from-midpoint') => {
    if (type === 'spouse') return 'var(--connector-spouse)';
    if (type === 'parent-child' || type === 'child-from-midpoint') return 'var(--connector-child)';
    return 'var(--connector-default)';
  };

  const canvasButtonsContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '12px', 
    left: '12px', 
    zIndex: 20,
    display: 'flex',
    gap: '8px', 
  };


  if (!nodes || nodes.length === 0) {
    return (
      <div
        ref={canvasRef}
        className="w-full h-full relative overflow-auto bg-background rounded-lg p-4 flex flex-col items-center justify-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        tabIndex={-1}
      >
        <TooltipProvider>
          <div style={canvasButtonsContainerStyle}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-card hover:bg-accent/20"
                  onClick={onAutoArrangeNodes}
                >
                  <LayoutGrid className="w-5 h-5" />
                  <span className="sr-only">Rearrange Tree</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Rearrange Tree</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-card hover:bg-accent/20"
                  onClick={onInitiateAdd}
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="sr-only">Add New Person</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Add New Person</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <h2 className="text-xl font-semibold text-foreground mb-4 sr-only">Family Tree Canvas</h2>
        <p className="text-lg text-muted-foreground pt-16">Your family tree is empty.</p>
        <p className="text-sm text-muted-foreground mt-2">Start by adding a person using the '+' button on the canvas.</p>
      </div>
    );
  }

  const sourceNodeForLinking = linkingSourceNodeId ? nodes.find(n => n.id === linkingSourceNodeId) : null;

  return (
    <div
      ref={canvasRef}
      className={cn(
        "w-full h-full relative overflow-auto bg-background rounded-lg p-4",
        linkingSourceNodeId || isFindingRelationshipMode ? "cursor-crosshair" : ""
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      tabIndex={-1}
    >
      <TooltipProvider>
        <div style={canvasButtonsContainerStyle}>
            <Tooltip>
            <TooltipTrigger asChild>
                <Button
                variant="outline"
                size="icon"
                className="bg-card hover:bg-accent/20"
                onClick={onAutoArrangeNodes}
                >
                <LayoutGrid className="w-5 h-5" />
                <span className="sr-only">Rearrange Tree</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>Rearrange Tree</p>
            </TooltipContent>
            </Tooltip>
            <Tooltip>
            <TooltipTrigger asChild>
                <Button
                variant="outline"
                size="icon"
                className="bg-card hover:bg-accent/20"
                onClick={onInitiateAdd}
                >
                <UserPlus className="w-5 h-5" />
                <span className="sr-only">Add New Person</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>Add New Person</p>
            </TooltipContent>
            </Tooltip>
        </div>
      </TooltipProvider>

      <h2 className="text-xl font-semibold text-foreground mb-4 sr-only">Family Tree Canvas</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center pt-16"> 
        Click a person to see details. Drag to rearrange. Click Link icon to connect.
      </p>

      <div className="relative min-h-[600px]">
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker
              id="arrowhead-child"
              markerWidth="10"
              markerHeight="7"
              refX="7" 
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
              fill={getConnectorStrokeColor('parent-child')}
            >
              <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
          </defs>

          {edges.filter(edge => edge.type === 'spouse').map((edge) => {
            const sourceNode = nodes.find(n => n.id === edge.sourceId);
            const targetNode = nodes.find(n => n.id === edge.targetId);
            if (!sourceNode || !targetNode) return null;

            const sourceIsLeft = (sourceNode.x ?? 0) < (targetNode.x ?? 0);
            const p1 = getNodeCenter(sourceNode, sourceIsLeft ? 'right' : 'left');
            const p2 = getNodeCenter(targetNode, sourceIsLeft ? 'left' : 'right');
            
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            return (
              <React.Fragment key={edge.id}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={getConnectorStrokeColor(edge.type)}
                  strokeWidth={connectorThickness}
                  strokeDasharray={edge.status === 'divorced' ? "5,5" : undefined}
                />
                 {edge.status !== 'divorced' && (
                  <circle cx={midX} cy={midY} r={connectorThickness * 1.5} fill={getConnectorStrokeColor(edge.type)} />
                )}
              </React.Fragment>
            );
          })}

          {nodes.map(childNode => {
            const parentEdgesToThisChild = edges.filter(
              e => e.targetId === childNode.id && e.type === 'parent-child'
            );

            if (parentEdgesToThisChild.length === 0) return null;

            const parentIds = parentEdgesToThisChild.map(e => e.sourceId);
            const actualParentNodes = nodes.filter(n => parentIds.includes(n.id));
            const childAnchor = getNodeCenter(childNode, 'top');

            if (actualParentNodes.length === 2) {
              const [parent1, parent2] = actualParentNodes;
              const spouseEdgeBetweenParents = edges.find(
                e =>
                  e.type === 'spouse' &&
                  ((e.sourceId === parent1.id && e.targetId === parent2.id) ||
                   (e.sourceId === parent2.id && e.targetId === parent1.id))
              );

              if (spouseEdgeBetweenParents) {
                const p1NodeForSpouseLine = nodes.find(n => n.id === spouseEdgeBetweenParents.sourceId);
                const p2NodeForSpouseLine = nodes.find(n => n.id === spouseEdgeBetweenParents.targetId);

                if (p1NodeForSpouseLine && p2NodeForSpouseLine) {
                  const sourceIsLeftSpouse = (p1NodeForSpouseLine.x ?? 0) < (p2NodeForSpouseLine.x ?? 0);
                  const spouseLineP1 = getNodeCenter(p1NodeForSpouseLine, sourceIsLeftSpouse ? 'right' : 'left');
                  const spouseLineP2 = getNodeCenter(p2NodeForSpouseLine, sourceIsLeftSpouse ? 'left' : 'right');

                  const spouseMidX = (spouseLineP1.x + spouseLineP2.x) / 2;
                  const spouseMidY = (spouseLineP1.y + spouseLineP2.y) / 2; 
                  
                  const parentsBottomY = spouseMidY + (NODE_HEIGHT / 2); 
                  const horizontalChildBarY = parentsBottomY + VERTICAL_ELBOW_OFFSET;

                  const pathD = `M ${spouseMidX} ${spouseMidY} V ${horizontalChildBarY} H ${childAnchor.x} V ${childAnchor.y}`;
                  
                  return (
                    <path
                      key={`midpoint-to-${childNode.id}`}
                      d={pathD}
                      stroke={getConnectorStrokeColor('child-from-midpoint')}
                      strokeWidth={connectorThickness}
                      fill="none"
                      markerEnd="url(#arrowhead-child)"
                    />
                  );
                }
              }
            }

            return parentEdgesToThisChild.map(edge => {
              const parentNode = nodes.find(n => n.id === edge.sourceId);
              if (!parentNode) return null;

              const parentAnchor = getNodeCenter(parentNode, 'bottom');
              const pathD = `M ${parentAnchor.x} ${parentAnchor.y} V ${parentAnchor.y + VERTICAL_ELBOW_OFFSET} H ${childAnchor.x} V ${childAnchor.y}`;

              return (
                <path
                  key={edge.id}
                  d={pathD}
                  stroke={getConnectorStrokeColor(edge.type as TreeEdgeType)}
                  strokeWidth={connectorThickness}
                  fill="none"
                  markerEnd="url(#arrowhead-child)"
                />
              );
            });
          })}

          {linkingSourceNodeId && sourceNodeForLinking && linkingMouseCoords && (
            (() => {
              const p1 = getNodeCenter(sourceNodeForLinking, 'center');
              return (
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={linkingMouseCoords.x}
                  y2={linkingMouseCoords.y}
                  stroke="hsl(var(--accent))"
                  strokeWidth={connectorThickness}
                  strokeDasharray="5,5"
                />
              );
            })()
          )}
        </svg>

        {nodes.map((node) => {
          let nodeBgClass = 'bg-[var(--custom-theme-color-node-bg)]';
          let nodeBorderClass = 'border-[var(--custom-theme-color-node-border)]';

          if (node.deathDate && node.deathDate.trim() !== '') {
            nodeBgClass = 'bg-[var(--node-deceased-bg)]';
            nodeBorderClass = 'border-[var(--node-deceased-border)]';
          } else if (node.gender === 'male') {
            nodeBgClass = 'bg-[var(--node-male-bg)]';
            nodeBorderClass = 'border-[var(--node-male-border)]';
          } else if (node.gender === 'female') {
            nodeBgClass = 'bg-[var(--node-female-bg)]';
            nodeBorderClass = 'border-[var(--node-female-border)]';
          }
          // Removed the explicit else if for 'other' or 'unknown'
          // Now, if not deceased, male, or female, it uses the default custom-theme-color set above.


          const isSelectedForDetails = selectedNodeId === node.id && !linkingSourceNodeId && !isFindingRelationshipMode;
          const isSelectedForLinking = linkingSourceNodeId === node.id;
          const isSelectedForFindingRel1 = isFindingRelationshipMode && findRelNode1Id === node.id;


          return (
            <Card
              key={node.id}
              id={`node-${node.id}`}
              data-node-id={node.id}
              draggable={!linkingSourceNodeId && !isFindingRelationshipMode}
              onDragStart={(e) => handleDragStart(e, node.id)}
              onClick={(e) => handleNodeCardClick(e, node.id)}
              className={cn(
                "absolute shadow-xl hover:shadow-2xl transition-all duration-300 z-10 border-2 flex flex-col",
                nodeBgClass,
                nodeBorderClass,
                linkingSourceNodeId || isFindingRelationshipMode ? "cursor-crosshair" : "cursor-grab",
                isSelectedForDetails ? "border-accent ring-2 ring-accent shadow-accent/50" : "",
                isSelectedForLinking ? "!border-blue-500 ring-2 ring-blue-500" : "",
                isSelectedForFindingRel1 ? "!border-green-500 ring-2 ring-green-500" : "",
                "active:cursor-grabbing"
              )}
              style={{
                left: `${node.x || 0}px`,
                top: `${node.y || 0}px`,
                width: `${NODE_WIDTH}px`,
                height: `${NODE_HEIGHT}px`,
                overflow: 'hidden',
                transform: (isSelectedForDetails || isSelectedForLinking || isSelectedForFindingRel1) ? 'scale(1.05)' : 'scale(1)',
              }}
              aria-label={`Family member: ${node.name}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNodeSelect(node.id)}}
            >
              <CardHeader className="p-3 flex flex-row items-center space-x-3 relative flex-shrink-0">
                {showNodePhotos && (
                  <Image
                    src={node.photoUrl || `https://placehold.co/80x80.png`}
                    alt={`Photo of ${node.name}`}
                    width={48}
                    height={48}
                    className="rounded-full border"
                    data-ai-hint={node["data-ai-hint"] || (node.photoUrl && !node.photoUrl.startsWith('https://placehold.co') ? 'person custom' : (node.gender === 'female' ? 'woman portrait' : (node.gender === 'male' ? 'man portrait' : 'person portrait')))}
                    draggable={false}
                  />
                )}
                <div className="flex-grow overflow-hidden">
                  <CardTitle className="text-md truncate" style={{fontFamily: 'var(--node-font-family)'}}>{node.name}</CardTitle>
                  {node.birthDate && <CardDescription className="text-xs truncate" style={{fontFamily: 'var(--node-font-family)'}}>B: {node.birthDate}</CardDescription>}
                  {node.deathDate && <CardDescription className="text-xs truncate" style={{fontFamily: 'var(--node-font-family)'}}>D: {node.deathDate}</CardDescription>}
                </div>
                {(!linkingSourceNodeId && !isFindingRelationshipMode) && (
                  <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-1 right-1 w-7 h-7 hover:bg-accent/20"
                      onClick={(e) => {
                          e.stopPropagation(); 
                          onInitiateLinking(node.id);
                      }}
                      title="Link this person"
                      aria-label="Start linking from this person"
                  >
                      <Link2Icon className="w-4 h-4" />
                  </Button>
                )}
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

    