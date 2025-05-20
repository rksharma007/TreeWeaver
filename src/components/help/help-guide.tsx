
'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Users, FilePlus, Upload, Download, Settings, FileJson, FileJson2, FileImage, FileText,
  UserPlus, Link2Icon as LinkIcon, LayoutGrid, UserCog, Palette, Type, Rows, Maximize, SearchCode, CheckCircle, HelpCircle, PaletteIcon, Edit, Trash2, Link2Off, RefreshCw
} from 'lucide-react';

const HelpSection: React.FC<{ title: string, icon?: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold text-primary mb-3 flex items-center">
      {icon && React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-5 w-5" })}
      {title}
    </h3>
    <div className="space-y-3 text-sm text-foreground/90 pl-2 border-l-2 border-muted ml-2">
      {children}
    </div>
  </div>
);

const Step: React.FC<{ number: number, children: React.ReactNode }> = ({ number, children }) => (
  <div className="flex items-start space-x-2 mb-2">
    <span className="flex-shrink-0 bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">{number}</span>
    <div className="text-sm">{children}</div> {/* Changed from <p> to <div> */}
  </div>
);

export function HelpGuide() {
  return (
    <div className="space-y-6 py-4">
      <Alert>
        <HelpCircle className="h-4 w-4" />
        <AlertTitle>Welcome to the TreeWeaver Guide!</AlertTitle>
        <AlertDescription>
          Lost in the leaves? Don't worry, this guide will help you become a master TreeWeaver. (Results may vary, especially if your family is... uniquely complex. 😉)
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <LayoutGrid className="mr-2 h-5 w-5 text-primary" /> The Canvas: Your Playground
          </AccordionTrigger>
          <AccordionContent className="pl-4 pt-2">
            <HelpSection title="Adding Your First... Relative">
              <Step number={1}>Look for the <UserPlus className="inline h-4 w-4 mx-1" /> (Add New Person) icon at the top-left of the canvas. Click it.</Step>
              <Step number={2}>The "Node Details" panel on the right will magically transform into an "Add New Person" form.</Step>
              <Step number={3}>Fill in the juicy details. A name is kinda important, just sayin'.</Step>
              <Step number={4}>Hit "Add Person to Tree." Poof! They exist. Now drag them somewhere sensible (or chaotic, we don't judge).</Step>
            </HelpSection>

            <HelpSection title="Connecting the Dots (Literally)">
              <Step number={1}>Hover over a person's card on the canvas. See that little <LinkIcon className="inline h-4 w-4 mx-1" /> (Link this person) icon? Click it.</Step>
              <Step number={2}>The canvas enters "linking mode." Your cursor turns into a crosshair, and a fancy line follows your mouse like a lost puppy.</Step>
              <Step number={3}>Click another person you want to connect them to.</Step>
              <Step number={4}>A dialog appears: "How are [Person A] and [Person B] related?"
                <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                  <li><strong>Parent-Child:</strong> The person you started the link <em>from</em> becomes the parent.</li>
                  <li><strong>Spouse:</strong> They become spouses (aww, or yikes).</li>
                </ul>
              </Step>
              <Step number={5}>Choose wisely, then hit "Confirm Relationship."</Step>
              <Step number={6}>Changed your mind mid-link? Press <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Escape</kbd> or click the canvas background.</Step>
            </HelpSection>

            <HelpSection title="Dragging Nodes Around">
              <Step number={1}>Click and hold on a person's card, then drag it. Release to drop. Simple, yet so satisfying.</Step>
            </HelpSection>
            
            <HelpSection title="The 'Make it Pretty (Maybe?)' Button">
              <Step number={1}>See the <LayoutGrid className="inline h-4 w-4 mx-1" /> (Rearrange Tree) icon at the top-left of the canvas? Click it.</Step>
              <Step number={2}>Our "highly advanced" algorithm will attempt to arrange your nodes into a hierarchy. Roots at the top, kids below, spouses next to each other.</Step>
              <Step number={3}>It tries, okay? For complex trees, "pretty" is subjective and sometimes a hilarious understatement.</Step>
            </HelpSection>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <UserCog className="mr-2 h-5 w-5 text-primary" /> Sidebar: Node Details Panel
          </AccordionTrigger>
          <AccordionContent className="pl-4 pt-2">
            <p className="text-sm text-muted-foreground mb-3">Click a person on the canvas, and this panel comes alive! If it's feeling shy, it might be because you're linking, finding a relationship, or a dialog is open.</p>
            <HelpSection title="Editing PII (Personally Identifiable Information)">
              <Step number={1}>Change names, birth/death dates, gender, and add those juicy notes that explain *everything*.</Step>
              <Step number={2}>Remember to hit "Save Changes" or your brilliant edits will vanish into the digital ether like that one sock.</Step>
            </HelpSection>
            <HelpSection title="Photo Fun">
              <Step number={1}>Click "Upload Photo" to give someone a face. Images get resized to a glorious 500x500px (perfect for consistent awkwardness).</Step>
              <Step number={2}>Alternatively, paste an image URL into the "Photo URL" field.</Step>
            </HelpSection>
            <HelpSection title="Relationship Drama Management">
              <Step number={1}>See sections for Parents, Spouses, and Children.</Step>
              <Step number={2}>To add: Click "Add Parent," "Add Spouse," or "Add Child." A dialog pops up. Select an *existing* person from your tree to link.</Step>
              <Step number={3}>To remove: Click the little <Link2Off className="inline h-4 w-4 mx-1 text-destructive" /> (broken link) icon next to a relationship. Poof! Gone.</Step>
              <Step number={4}>Spouse Status: For spouses, hover to reveal a <RefreshCw className="inline h-3 w-3 mx-1" /> (sync) icon. Click it to toggle between "Married" and "Divorced." Divorced couples get a stylish dotted line on the canvas.</Step>
            </HelpSection>
            <HelpSection title="Deleting a Person (Use With Caution!)">
              <Step number={1}>The big red "Delete Person" button. It's tempting, we know.</Step>
              <Step number={2}>It asks for confirmation, because we're not *total* monsters. This will also remove all relationships connected to them.</Step>
            </HelpSection>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <Settings className="mr-2 h-5 w-5 text-primary" /> Settings & Tools (Cog Icon in Header)
          </AccordionTrigger>
          <AccordionContent className="pl-4 pt-2">
            <p className="text-sm text-muted-foreground mb-3">Click the <Settings className="inline h-4 w-4 mx-1" /> (Settings) icon in the main site header (top right). A sheet slides out! Ooh, fancy.</p>
            <HelpSection title="Find Relationship">
              <Step number={1}>Click "Find Relationship."</Step>
              <Step number={2}>The panel guides you: "Select the first person on the canvas." Do it.</Step>
              <Step number={3}>"First person: [Name]. Select the second person." Do it again.</Step>
              <Step number={4}>A dialog reveals their connection (or lack thereof, if they're *really* distant relatives of your imagination).</Step>
            </HelpSection>
            <HelpSection title="Colors & Theme">
              <Step number={1}>**Default Node Color:** Pick a color for nodes that aren't specifically male, female, or deceased. Applied via the "Apply Visual Settings" button.</Step>
              <AlertDescription className="text-xs mt-1">Gender-specific colors (Blue for Male, Pink for Female) and Deceased status (Grey) override this default.</AlertDescription>
            </HelpSection>
            <HelpSection title="Typography">
              <Step number={1}>**Node Font Family:** Choose from a list of fonts. Click "Apply Visual Settings" to see the change.</Step>
            </HelpSection>
            <HelpSection title="Layout & Structure">
              <Step number={1}>**Show Profile Photos:** Toggle to show or hide faces on the node cards. Click "Apply Visual Settings."</Step>
            </HelpSection>
            <HelpSection title="Node & Connector Style">
              <Step number={1}>**Connector Line Thickness:** Use the slider to make lines skinny or chonky. Updates live!</Step>
            </HelpSection>
            <HelpSection title="Applying Your Masterpieces">
              <Step number={1}>Click the <CheckCircle className="inline h-4 w-4 mx-1" /> "Apply Visual Settings" button to make your Default Node Color, Font Family, and Photo Visibility choices take effect on the canvas.</Step>
            </HelpSection>
          </AccordionContent>
        </AccordionItem>

         <AccordionItem value="item-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <Users className="mr-2 h-5 w-5 text-primary" /> Header Bar: Royal Command Center
          </AccordionTrigger>
          <AccordionContent className="pl-4 pt-2">
            <p className="text-sm text-muted-foreground mb-3">At the very top of the page. Your main navigation.</p>
            <HelpSection title="New Tree">
                <Step number={1}>Click <FilePlus className="inline h-4 w-4 mx-1" /> "New Tree" for when your current tree looks like a bowl of spaghetti and you just want to start over. Clears everything. A fresh slate!</Step>
            </HelpSection>
            <HelpSection title="Import JSON">
                <Step number={1}>Click <FileJson className="inline h-4 w-4 mx-1" /> "Import JSON" to upload a previously exported TreeWeaver JSON file. Watch your tree magically (or tragically) reappear.</Step>
            </HelpSection>
            <HelpSection title="Export Dropdown">
                <Step number={1}>Click <Download className="inline h-4 w-4 mx-1" /> "Export" to reveal options:</Step>
                <ul className="list-disc list-inside ml-4 mt-1 text-xs space-y-1">
                    <li><FileJson2 className="inline h-4 w-4 mr-1" /><strong>Export as JSON:</strong> The most reliable way to save your work.</li>
                    <li><FileImage className="inline h-4 w-4 mr-1" /><strong>Export as PNG:</strong> Get a picture of your canvas masterpiece.</li>
                    <li><FileText className="inline h-4 w-4 mr-1" /><strong>Export as PDF:</strong> For a slightly more formal picture of your canvas.</li>
                    <li>Other options might be disabled (because we're lazy... or, uh, "prioritizing").</li>
                </ul>
            </HelpSection>
             <HelpSection title="Settings & Tools (Cog Icon)">
                <Step number={1}>Click the <Settings className="inline h-4 w-4 mx-1" /> icon. This opens the Settings & Tools panel (see above for details on what's inside).</Step>
            </HelpSection>
             <HelpSection title="Help & Guide (This thing you're reading!)">
                <Step number={1}>Click the <HelpCircle className="inline h-4 w-4 mx-1" /> icon. Congratulations, you've found the infinite loop of help!</Step>
            </HelpSection>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <PaletteIcon className="mr-2 h-5 w-5 text-primary" /> Customization Tips
          </AccordionTrigger>
          <AccordionContent className="pl-4 pt-2">
            <HelpSection title="Theme Colors (`src/app/globals.css`)">
                <p>This file is the heart of the color scheme. Look for CSS variables like:</p>
                <ul className="list-disc list-inside ml-4 my-2 text-xs font-mono bg-muted p-2 rounded">
                    <li>--background, --foreground</li>
                    <li>--primary (buttons, active elements - currently <span className="p-1 rounded" style={{backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))'}}>#e9e389</span>)</li>
                    <li>--accent, --card, --popover, etc.</li>
                </ul>
                <p>You can tweak these HSL values. Be careful, or it might look like a unicorn threw up.</p>
            </HelpSection>
             <HelpSection title="Node Specific Colors (`src/app/globals.css`)">
                <p>More CSS variables for node styling:</p>
                <ul className="list-disc list-inside ml-4 my-2 text-xs font-mono bg-muted p-2 rounded">
                    <li>--custom-theme-color-node-bg (fallback, set by UI)</li>
                    <li>--node-male-bg, --node-female-bg, --node-other-bg, --node-deceased-bg</li>
                    <li>Matching --node-*-border variables.</li>
                </ul>
            </HelpSection>
             <HelpSection title="Connector Colors (`src/app/globals.css`)">
                 <ul className="list-disc list-inside ml-4 my-2 text-xs font-mono bg-muted p-2 rounded">
                    <li>--connector-spouse (violet/pink)</li>
                    <li>--connector-child (green)</li>
                    <li>--connector-default</li>
                </ul>
            </HelpSection>
            <HelpSection title="Fonts">
                <p>Main app font is Merriweather (<code>src/app/layout.tsx</code>).</p>
                <p>Node fonts are set via UI (Settings & Tools panel) and apply <code>--node-font-family</code> CSS variable. You can add more font options in <code>CustomizationPanel.tsx</code>.</p>
            </HelpSection>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

       <Alert variant="destructive" className="mt-8">
        <UserCog className="h-4 w-4" />
        <AlertTitle>Known "Features" (aka Quirks)</AlertTitle>
        <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>Auto-Arrange is... Opinionated:</strong> Our layout algorithm tries its best. For super complex trees, it might produce "creative" arrangements. Manual dragging is your friend.</li>
                <li><strong>Performance on Huge Trees:</strong> If you're charting the entire history of mankind, your browser might start sweating. Keep it reasonable, folks.</li>
                <li><strong>Image Export Imperfections:</strong> <code>html2canvas</code> is cool, but not a miracle worker. Complex node content or specific CSS might look *slightly* different in PNG/PDF exports.</li>
            </ul>
        </AlertDescription>
      </Alert>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Happy Weaving! Now go forth and untangle that family chaos (or make it worse, we won't tell).
      </p>
    </div>
  );
}
