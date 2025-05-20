
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { siteConfig } from '@/config/site';
import { Users, FilePlus, Upload, Download, Settings, FileJson, FileJson2, FileImage, FileText, HelpCircle } from 'lucide-react'; 
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogHelpDescription } from '@/components/ui/dialog'; // Renamed to avoid conflict
import { CustomizationPanel } from '@/components/tree/customization-panel';
import { HelpGuide } from '@/components/help/help-guide';
import { ScrollArea } from '../ui/scroll-area';


interface AppliedVisualSettings {
  fontFamily: string;
  showPhotos: boolean;
  customNodeColor: string;
}

interface SiteHeaderProps {
  onExportJSON: () => void;
  onImportJSON: (fileContent: string) => void;
  onNewTree: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  isSettingsSheetOpen: boolean;
  onToggleSettingsSheet: () => void;
  isHelpDialogOpen: boolean;
  onToggleHelpDialog: () => void;
  connectorThickness: number;
  onConnectorThicknessChange: (thickness: number) => void;
  isFindingRelationshipMode: boolean;
  findRelNode1Id: string | null;
  findRelNode1Name: string | null;
  onInitiateFindRelationship: () => void;
  onCancelFindRelationship: () => void;
  appliedVisualSettings: AppliedVisualSettings;
  onApplyVisualCustomizations: (settings: AppliedVisualSettings) => void;
}

export default function SiteHeader({ 
  onExportJSON, 
  onImportJSON, 
  onNewTree,
  onExportPNG,
  onExportPDF,
  isSettingsSheetOpen,
  onToggleSettingsSheet,
  isHelpDialogOpen,
  onToggleHelpDialog,
  connectorThickness,
  onConnectorThicknessChange,
  isFindingRelationshipMode,
  findRelNode1Id,
  findRelNode1Name,
  onInitiateFindRelationship,
  onCancelFindRelationship,
  appliedVisualSettings,
  onApplyVisualCustomizations,
}: SiteHeaderProps) {
  const importFileRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onImportJSON(content);
        } else {
          toast({ title: "Import Error", description: "Could not read file content.", variant: "destructive" });
        }
      };
      reader.onerror = () => {
        toast({ title: "Import Error", description: "Failed to read file.", variant: "destructive" });
      }
      reader.readAsText(file);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary-foreground">{siteConfig.name}</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={onNewTree}>
              <FilePlus className="mr-2 h-4 w-4" />
              New Tree
            </Button>

            <input
              type="file"
              ref={importFileRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".json"
            />
            <Button variant="ghost" size="sm" onClick={handleImportClick}>
              <FileJson className="mr-2 h-4 w-4" />
              Import JSON
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportJSON}>
                  <FileJson2 className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportPNG}>
                  <FileImage className="mr-2 h-4 w-4" />
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Export as JPG</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Export as GEDCOM</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="rounded-full" onClick={onToggleHelpDialog}>
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Help & Guide</span>
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full" onClick={onToggleSettingsSheet}>
              <Settings className="h-5 w-5" />
              <span className="sr-only">Tree Settings & Tools</span>
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={isSettingsSheetOpen} onOpenChange={onToggleSettingsSheet}>
        <SheetContent className="w-[380px] sm:w-[420px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Settings & Tools</SheetTitle>
            <SheetDescription>
              Customize tree appearance and use tools.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4">
              <CustomizationPanel
                connectorThickness={connectorThickness}
                onConnectorThicknessChange={onConnectorThicknessChange}
                isFindingRelationshipMode={isFindingRelationshipMode}
                findRelNode1Id={findRelNode1Id}
                findRelNode1Name={findRelNode1Name}
                onInitiateFindRelationship={onInitiateFindRelationship}
                onCancelFindRelationship={onCancelFindRelationship}
                initialAppliedSettings={appliedVisualSettings}
                onApplyVisualCustomizations={onApplyVisualCustomizations}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Dialog open={isHelpDialogOpen} onOpenChange={onToggleHelpDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>TreeWeaver Help & Guide</DialogTitle>
            <DialogHelpDescription>
              Your trusty map to navigating the branches of your family tree!
            </DialogHelpDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow overflow-y-auto pr-6">
            <HelpGuide />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
