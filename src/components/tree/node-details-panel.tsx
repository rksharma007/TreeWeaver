
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImagePlus, Save, Trash2, UserPlus, XCircle, Link2, Link2Off, Users, Heart, UserCheck, RefreshCw } from 'lucide-react'; // Added RefreshCw
import type { TreeNodeData, TreeEdgeData, TreeEdgeType, RelationshipDialogState, SpouseEdgeStatus } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface NodeDetailsPanelProps {
  allNodes: TreeNodeData[];
  allEdges: TreeEdgeData[];
  currentNode: TreeNodeData | null;
  isAddingMode: boolean;
  onInitiateAdd: () => void; // This prop might become unused here if button moves
  onCancel: () => void;
  onSave: (nodeData: Partial<TreeNodeData>, nodeIdToUpdate?: string) => void;
  onDelete: (nodeId: string) => void;
  onAddEdge: (sourceId: string, targetId: string, type: TreeEdgeType) => void;
  onRemoveEdge: (edgeId: string) => void;
  onUpdateEdgeStatus: (edgeId: string, newStatus: SpouseEdgeStatus) => void;
}

const FIXED_PHOTO_WIDTH = 500;
const FIXED_PHOTO_HEIGHT = 500;

type RelatedSpouseNode = TreeNodeData & { edgeId: string; status?: SpouseEdgeStatus };


export function NodeDetailsPanel({
  allNodes,
  allEdges,
  currentNode,
  isAddingMode,
  onInitiateAdd, // Kept for now, but button is moving
  onCancel,
  onSave,
  onDelete,
  onAddEdge,
  onRemoveEdge,
  onUpdateEdgeStatus,
}: NodeDetailsPanelProps) {
  const [formData, setFormData] = React.useState<Partial<TreeNodeData>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [relationshipDialog, setRelationshipDialog] = React.useState<RelationshipDialogState>({
    open: false,
    type: null,
    mode: null,
  });
  const [selectedRelNodeId, setSelectedRelNodeId] = React.useState<string>('');

  React.useEffect(() => {
    if (isAddingMode && !currentNode) {
      setFormData({ gender: 'unknown' }); 
    } else if (currentNode) {
      setFormData(currentNode);
    } else {
      setFormData({});
    }
  }, [currentNode, isAddingMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value: TreeNodeData['gender']) => {
    setFormData(prev => ({ ...prev, gender: value }));
  };

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const originalDataUrl = reader.result as string;
        
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = FIXED_PHOTO_WIDTH;
          canvas.height = FIXED_PHOTO_HEIGHT;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Calculate new dimensions to maintain aspect ratio
            let newWidth, newHeight;
            let offsetX = 0;
            let offsetY = 0;

            if (img.width / img.height > FIXED_PHOTO_WIDTH / FIXED_PHOTO_HEIGHT) {
                newHeight = FIXED_PHOTO_HEIGHT;
                newWidth = (img.width * FIXED_PHOTO_HEIGHT) / img.height;
                offsetX = (FIXED_PHOTO_WIDTH - newWidth) / 2;
            } else {
                newWidth = FIXED_PHOTO_WIDTH;
                newHeight = (img.height * FIXED_PHOTO_WIDTH) / img.width;
                offsetY = (FIXED_PHOTO_HEIGHT - newHeight) / 2;
            }
            
            ctx.clearRect(0, 0, FIXED_PHOTO_WIDTH, FIXED_PHOTO_HEIGHT);
            ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

            const resizedDataUrl = canvas.toDataURL(file.type || 'image/png'); 
            setFormData(prev => ({ ...prev, photoUrl: resizedDataUrl }));
            toast({ title: "Photo Processed", description: `Photo has been resized to fit ${FIXED_PHOTO_WIDTH}x${FIXED_PHOTO_HEIGHT}px and is ready to be saved.`});
          } else {
            setFormData(prev => ({ ...prev, photoUrl: originalDataUrl }));
            toast({ title: "Photo Loaded (Original)", description: "Could not resize photo, using original.", variant: "default" });
          }
        };
        img.onerror = () => {
           setFormData(prev => ({ ...prev, photoUrl: originalDataUrl })); 
           toast({ title: "Photo Load Error", description: "Could not load image for resizing, using original.", variant: "destructive" });
        };
        img.src = originalDataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    if (!formData.name?.trim()) {
      toast({title: "Validation Error", description: "Name is required.", variant: "destructive"});
      return;
    }
    onSave(formData, currentNode?.id);
  };

  const handleDeletePerson = () => {
    if (currentNode) {
      onDelete(currentNode.id);
    }
  };

  const openRelationshipDialog = (mode: 'parent' | 'child' | 'spouse') => {
    setSelectedRelNodeId(''); 
    let type: TreeEdgeType | null = null;
    if (mode === 'parent' || mode === 'child') type = 'parent-child';
    if (mode === 'spouse') type = 'spouse';
    setRelationshipDialog({ open: true, type, mode });
  };

  const handleConfirmAddRelationship = () => {
    if (!currentNode || !selectedRelNodeId || !relationshipDialog.type || !relationshipDialog.mode) return;

    let sourceId = '';
    let targetId = '';

    if (relationshipDialog.mode === 'parent') {
      sourceId = selectedRelNodeId; 
      targetId = currentNode.id;   
    } else if (relationshipDialog.mode === 'child') {
      sourceId = currentNode.id;   
      targetId = selectedRelNodeId; 
    } else if (relationshipDialog.mode === 'spouse') {
      sourceId = currentNode.id;
      targetId = selectedRelNodeId;
    }

    onAddEdge(sourceId, targetId, relationshipDialog.type);
    setRelationshipDialog({ open: false, type: null, mode: null });
  };

  const getRelatedNodes = (nodeId: string, relationshipType: TreeEdgeType, asRole: 'source' | 'target' | 'either') => {
    return allEdges
      .filter(edge => {
        if (edge.type !== relationshipType) return false;
        if (asRole === 'source' && edge.targetId === nodeId) return true; 
        if (asRole === 'target' && edge.sourceId === nodeId) return true; 
        if (asRole === 'either' && (edge.sourceId === nodeId || edge.targetId === nodeId)) return true;
        return false;
      })
      .map(edge => {
        let relatedNodeId = (asRole === 'source' || (asRole === 'either' && edge.targetId === nodeId)) ? edge.sourceId : edge.targetId;
        if (relationshipType === 'spouse' && asRole === 'either') {
            relatedNodeId = edge.sourceId === nodeId ? edge.targetId : edge.sourceId;
        }
        const relatedNode = allNodes.find(n => n.id === relatedNodeId);
        return relatedNode ? { ...relatedNode, edgeId: edge.id, status: edge.status } : null;
      })
      .filter(node => node !== null) as (TreeNodeData & { edgeId: string; status?: SpouseEdgeStatus })[];
  };

  const parents = currentNode ? getRelatedNodes(currentNode.id, 'parent-child', 'source') : [];
  const spouses: RelatedSpouseNode[] = currentNode ? getRelatedNodes(currentNode.id, 'spouse', 'either') as RelatedSpouseNode[] : [];
  const children = currentNode ? getRelatedNodes(currentNode.id, 'parent-child', 'target') : [];

  const availableNodesForRelationship = allNodes.filter(n => {
    if (!currentNode || n.id === currentNode.id) return false; 
    if (relationshipDialog.mode === 'parent' && parents.some(p => p.id === n.id)) return false;
    if (relationshipDialog.mode === 'child' && children.some(c => c.id === n.id)) return false;
    if (relationshipDialog.mode === 'spouse' && spouses.some(s => s.id === n.id)) return false;
    if ((relationshipDialog.mode === 'parent' || relationshipDialog.mode === 'child') && n.id === currentNode.id) return false;
    return true;
  });

  const handleToggleSpouseStatus = (edgeId: string, currentStatus?: SpouseEdgeStatus) => {
    const newStatus = currentStatus === 'divorced' ? 'married' : 'divorced';
    onUpdateEdgeStatus(edgeId, newStatus);
  };


  if (!currentNode && !isAddingMode) {
    return (
      <div className="p-4 space-y-6 text-center">
        <p className="text-muted-foreground">Select a person on the tree to see their details, or add a new person using the button on the canvas.</p>
        {/* "Add New Person" button that was here is now moved to TreeCanvas */}
      </div>
    );
  }

  const formTitle = isAddingMode ? "Add New Person" : "Edit Person Details";
  const saveButtonText = isAddingMode ? "Add Person to Tree" : "Save Changes";

  return (
    <ScrollArea className="h-full pr-2">
    <div className="space-y-6 pb-6">
      <h3 className="text-lg font-semibold text-foreground">{formTitle}</h3>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Enter full name" />
      </div>

      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={formData.photoUrl || undefined} alt={formData.name || 'Person'} data-ai-hint="person portrait" />
          <AvatarFallback>{formData.name ? formData.name.substring(0, 2).toUpperCase() : 'PN'}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <Button variant="outline" size="sm" onClick={handlePhotoUploadClick}>
            <ImagePlus className="mr-2 h-4 w-4" /> Upload Photo
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
          />
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF. Resized to {FIXED_PHOTO_WIDTH}x{FIXED_PHOTO_HEIGHT}px.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoUrl">Photo URL (or upload)</Label>
        <Input id="photoUrl" name="photoUrl" value={formData.photoUrl || ''} onChange={handleInputChange} placeholder="https://example.com/photo.jpg" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Birth Date</Label>
          <Input id="birthDate" name="birthDate" type="date" value={formData.birthDate || ''} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deathDate">Death Date (Optional)</Label>
          <Input id="deathDate" name="deathDate" type="date" value={formData.deathDate || ''} onChange={handleInputChange} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select name="gender" value={formData.gender || 'unknown'} onValueChange={handleGenderChange}>
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Biography</Label>
        <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleInputChange} placeholder="Add any relevant notes or a short biography..." rows={3} />
      </div>

      <Separator />

      {currentNode && !isAddingMode && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold flex items-center"><Link2 className="mr-2 h-5 w-5 text-accent-foreground" />Relationships</h4>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="flex items-center"><Users className="mr-2 h-4 w-4 text-muted-foreground" />Parents</Label>
              <Button variant="outline" size="sm" onClick={() => openRelationshipDialog('parent')}>
                <UserCheck className="mr-2 h-4 w-4" /> Add Parent
              </Button>
            </div>
            {parents.length > 0 ? (
              <ul className="space-y-1">
                {parents.map(p => (
                  <li key={p.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                    <span>{p.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveEdge(p.edgeId)}>
                      <Link2Off className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-muted-foreground">No parents linked.</p>}
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center">
                <Label className="flex items-center"><Heart className="mr-2 h-4 w-4 text-muted-foreground" />Spouses</Label>
                <Button variant="outline" size="sm" onClick={() => openRelationshipDialog('spouse')}>
                    <UserCheck className="mr-2 h-4 w-4" /> Add Spouse
                </Button>
            </div>
            {spouses.length > 0 ? (
              <ul className="space-y-1">
                {spouses.map(s => (
                  <li key={s.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md group">
                    <div>
                      <span>{s.name} </span>
                      <span className="text-xs text-muted-foreground">({s.status === 'divorced' ? 'Divorced' : 'Married'})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title={s.status === 'divorced' ? "Mark as Married" : "Mark as Divorced"}
                            onClick={() => handleToggleSpouseStatus(s.edgeId, s.status)}
                        >
                            <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Remove relationship"
                            onClick={() => onRemoveEdge(s.edgeId)}
                        >
                            <Link2Off className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-muted-foreground">No spouses linked.</p>}
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center">
                <Label className="flex items-center"><Users className="mr-2 h-4 w-4 text-muted-foreground" />Children</Label>
                <Button variant="outline" size="sm" onClick={() => openRelationshipDialog('child')}>
                   <UserCheck className="mr-2 h-4 w-4" /> Add Child
                </Button>
            </div>
            {children.length > 0 ? (
              <ul className="space-y-1">
                {children.map(c => (
                  <li key={c.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                    <span>{c.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveEdge(c.edgeId)}>
                      <Link2Off className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-muted-foreground">No children linked.</p>}
          </div>
        </div>
      )}


      <Separator />

      <div className="flex flex-col space-y-2">
        <Button onClick={handleSaveChanges} disabled={!formData.name?.trim()}>
          <Save className="mr-2 h-4 w-4" /> {saveButtonText}
        </Button>

        {isAddingMode && (
          <Button variant="outline" onClick={onCancel}>
            <XCircle className="mr-2 h-4 w-4" /> Cancel Add
          </Button>
        )}

        {currentNode && !isAddingMode && (
          <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Person</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {currentNode.name}? This action cannot be undone and will remove all associated relationships.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={() => { handleDeletePerson(); (document.querySelector('[data-radix-dialog-close][type=button]') as HTMLElement)?.click();}}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* "Add Another Person" button removed from here */}
          </>
        )}
      </div>

      <Dialog open={relationshipDialog.open} onOpenChange={(open) => setRelationshipDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {relationshipDialog.mode}</DialogTitle>
            <DialogDescription>Select a person to link as a {relationshipDialog.mode} to {currentNode?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={selectedRelNodeId} onValueChange={setSelectedRelNodeId}>
              <SelectTrigger>
                <SelectValue placeholder={`Select a person...`} />
              </SelectTrigger>
              <SelectContent>
                {availableNodesForRelationship.length > 0 ? (
                  availableNodesForRelationship.map(node => (
                    <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No available people to link for this role.</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRelationshipDialog({ open: false, type: null, mode: null })}>Cancel</Button>
            <Button onClick={handleConfirmAddRelationship} disabled={!selectedRelNodeId}>Add Relationship</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ScrollArea>
  );
}

    