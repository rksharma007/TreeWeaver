
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Type, Rows, Maximize, PaletteIcon, SearchCode, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AppliedVisualSettings {
  fontFamily: string;
  showPhotos: boolean;
  customNodeColor: string;
}

interface CustomizationPanelProps {
  connectorThickness: number;
  onConnectorThicknessChange: (thickness: number) => void;
  isFindingRelationshipMode: boolean;
  findRelNode1Id: string | null;
  findRelNode1Name: string | null;
  onInitiateFindRelationship: () => void;
  onCancelFindRelationship: () => void;
  initialAppliedSettings: AppliedVisualSettings;
  onApplyVisualCustomizations: (settings: AppliedVisualSettings) => void;
}

export function CustomizationPanel({
  connectorThickness,
  onConnectorThicknessChange,
  isFindingRelationshipMode,
  findRelNode1Id,
  findRelNode1Name,
  onInitiateFindRelationship,
  onCancelFindRelationship,
  initialAppliedSettings,
  onApplyVisualCustomizations,
}: CustomizationPanelProps) {
  const { toast } = useToast();

  // Local state for staging changes
  const [stagedCustomNodeColor, setStagedCustomNodeColor] = React.useState(initialAppliedSettings.customNodeColor);
  const [stagedFontFamily, setStagedFontFamily] = React.useState(initialAppliedSettings.fontFamily);
  const [stagedShowPhotos, setStagedShowPhotos] = React.useState(initialAppliedSettings.showPhotos);

  // Placeholder states - not applied by the button yet
  const [nodeShape, setNodeShape] = React.useState('rectangle');
  const [layoutDirection, setLayoutDirection] = React.useState('TB');
  
  React.useEffect(() => {
    setStagedCustomNodeColor(initialAppliedSettings.customNodeColor);
    setStagedFontFamily(initialAppliedSettings.fontFamily);
    setStagedShowPhotos(initialAppliedSettings.showPhotos);
  }, [initialAppliedSettings]);


  const handleApplyChanges = () => {
    onApplyVisualCustomizations({
      customNodeColor: stagedCustomNodeColor,
      fontFamily: stagedFontFamily,
      showPhotos: stagedShowPhotos,
    });
    // toast({ title: "Visual Settings Applied", description: "Node color, font, and photo visibility updated." });
  };

  const handleThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newThickness = parseInt(e.target.value, 10);
    if (!isNaN(newThickness) && newThickness >= 1 && newThickness <= 10) {
      onConnectorThicknessChange(newThickness);
    }
  };

  let findRelationshipStatusText = "Click 'Find Relationship' then select two people on the canvas.";
  if (isFindingRelationshipMode) {
    if (!findRelNode1Id) {
      findRelationshipStatusText = "Select the first person on the canvas.";
    } else if (findRelNode1Name) {
      findRelationshipStatusText = `First person: ${findRelNode1Name}. Select the second person on the canvas.`;
    } else {
      findRelationshipStatusText = `First person selected. Select the second person on the canvas.`;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-md font-semibold text-foreground mb-3 flex items-center">
          <SearchCode className="mr-2 h-5 w-5 text-accent-foreground" /> Find Relationship
        </h4>
        <div className="space-y-3">
          <Button
            onClick={isFindingRelationshipMode ? onCancelFindRelationship : onInitiateFindRelationship}
            variant={isFindingRelationshipMode ? "destructive" : "default"}
            className="w-full"
          >
            {isFindingRelationshipMode ? "Cancel Finding" : "Find Relationship"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">{findRelationshipStatusText}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-md font-semibold text-foreground mb-3 flex items-center">
          <PaletteIcon className="mr-2 h-5 w-5 text-accent-foreground" /> Colors & Theme
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customNodeColor">Default Node Color (Non-Gendered)</Label>
            <div className="flex items-center space-x-2">
              <Input id="customNodeColor" type="color" value={stagedCustomNodeColor} onChange={(e) => setStagedCustomNodeColor(e.target.value)} className="p-1 h-10 w-14" />
              <Input type="text" value={stagedCustomNodeColor} onChange={(e) => setStagedCustomNodeColor(e.target.value)} placeholder="#D1D5DB" className="flex-1" />
            </div>
            <p className="text-xs text-muted-foreground">Fallback color for nodes without a specific gender or deceased status. Applied via button below.</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-md font-semibold text-foreground mb-3 flex items-center">
          <Type className="mr-2 h-5 w-5 text-accent-foreground" /> Typography
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Node Font Family</Label>
            <Select value={stagedFontFamily} onValueChange={setStagedFontFamily}>
              <SelectTrigger id="fontFamily">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Merriweather">Merriweather (Serif)</SelectItem>
                <SelectItem value="Lora">Lora (Serif)</SelectItem>
                <SelectItem value="Roboto">Roboto (Sans-Serif)</SelectItem>
                <SelectItem value="Open Sans">Open Sans (Sans-Serif)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Applied via button below.</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-md font-semibold text-foreground mb-3 flex items-center">
          <Rows className="mr-2 h-5 w-5 text-accent-foreground" /> Layout & Structure
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm">
             <Label htmlFor="showPhotos" className="cursor-pointer">Show Profile Photos in Nodes</Label>
             <Switch id="showPhotos" checked={stagedShowPhotos} onCheckedChange={setStagedShowPhotos} />
          </div>
           <p className="text-xs text-muted-foreground text-center">Photo visibility applied via button below.</p>
          <div className="space-y-2 opacity-50 cursor-not-allowed"> {/* Placeholder styling */}
            <Label htmlFor="layoutDirection">Layout Direction (Visual Placeholder)</Label>
            <Select value={layoutDirection} onValueChange={setLayoutDirection} disabled>
              <SelectTrigger id="layoutDirection">
                <SelectValue placeholder="Select layout direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TB">Top to Bottom</SelectItem>
                <SelectItem value="LR">Left to Right</SelectItem>
              </SelectContent>
            </Select>
             <p className="text-xs text-muted-foreground">Note: This affects manual placement guidance, not the auto-arrange feature.</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-md font-semibold text-foreground mb-3 flex items-center">
          <Maximize className="mr-2 h-5 w-5 text-accent-foreground" /> Node & Connector Style
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connectorThickness">Connector Line Thickness (px)</Label>
            <Input
              id="connectorThickness"
              type="number"
              value={connectorThickness}
              onChange={handleThicknessChange}
              min="1"
              max="10"
            />
            <p className="text-xs text-muted-foreground">Applied in real-time.</p>
          </div>
          <div className="space-y-2 opacity-50 cursor-not-allowed"> {/* Placeholder styling */}
            <Label htmlFor="nodeShape">Node Shape (Visual Placeholder)</Label>
            <Select value={nodeShape} onValueChange={setNodeShape} disabled>
              <SelectTrigger id="nodeShape">
                <SelectValue placeholder="Select node shape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="ellipse">Ellipse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <Button onClick={handleApplyChanges} className="w-full">
        <CheckCircle className="mr-2 h-4 w-4" />
        Apply Visual Settings
      </Button>
       <p className="text-xs text-muted-foreground mt-1 text-center">Applies node color, font, and photo visibility. Connector thickness is real-time.</p>
    </div>
  );
}
