
# 🌳 TreeWeaver: Weaving Your Family Chaos, One Node at a Time! 🤪

Welcome to TreeWeaver, the app where you can meticulously chart out your family lineage, complete with all the drama, questionable photo choices, and complex relationships that make families... well, *families*. If you thought your family tree was complicated, just wait until you try to build it here! (Just kidding... mostly. 😉)

## 🤔 What is this Sorcery? (Overview)

TreeWeaver is your digital canvas for creating, customizing, and sharing beautiful (or beautifully chaotic) family histories. It boasts an interactive, drag-and-drop interface because clicking is too mainstream. Built with the fanciest modern tech like Next.js, React, ShadCN UI, and Tailwind CSS, it's probably more advanced than your great-great-aunt Mildred's understanding of "the internet."

## ✨ Features (The Good Stuff You Actually Care About)

*   **Visual Tree Building:** Click, drag, connect. It's like playing with digital LEGOs, but for people.
*   **Node Management:**
    *   ➕ **Add People:** Bring new folks into your digital world.
    *   ✏️ **Edit Details:** Names, birth/death dates, photos, gender, and even those juicy "notes" only you will understand.
    *   🖼️ **Photo Uploads:** Immortalize Uncle Bob's terrible fishing hat (photos are resized to 500x500px, so they're *consistently* terrible).
    *   🗑️ **Delete People:** Oops, did cousin Eddie get disowned again? We've got a button for that.
*   **Relationship Superpowers:**
    *   🔗 **Visual Linking:** Click a node's link icon, then click another node. Bam! Instant connection. A dialog will pop up asking "So, what's the tea? Parent-child or spouse?"
    *   💔 **Spouse Status:** Mark couples as 'married' or 'divorced'. Divorced? Expect a dramatic dotted line.
    *   👨‍👩‍👧‍👦 **Manage Connections:** Via the "Node Details" panel, you can assign parents, spouses (multiple, if you're feeling spicy), and children.
*   **Interactive Canvas:**
    *   🖱️ **Node Selection:** Click a person to spill their details in the sidebar.
    *   🤏 **Drag & Drop Nodes:** Because manual labor is... character-building?
    *   🪄 **Auto-Rearrange:** Click the magic grid icon on the canvas. Our "highly advanced" algorithm will *attempt* a hierarchical layout. No promises it'll be perfect, but it tries its best, bless its heart.
*   **Import/Export Like a Boss:**
    *   💾 **JSON Export/Import:** Save your precious work (or escape route) as a JSON file. Load it back when you're ready for more punishment.
    *   📸 **PNG/PDF Export:** Create a snapshot of your masterpiece. Perfect for slideshows no one asked for.
*   **Customization Galore (via Settings & Tools ⚙️):**
    *   🕵️ **Find Relationship Tool:** "How am I related to this random person I just added?" We'll *try* to tell you.
    *   🎨 **Node Colors:** Default color for the mysterious ones, plus automatic blue for males, pink for females, and a distinguished grey for the deceased.
    *   ✍️ **Typography:** Choose node fonts, because Comic Sans is a choice (a bad one).
    *   🖼️ **Photo Visibility:** Toggle profile pics on/off.
    *   📏 **Connector Thickness:** Make those lines THICC or elegantly thin.

## 🚀 Getting Started (If You Dare...)

So, you're brave enough to try? Okay, here's the drill.

### Prerequisites

*   Node.js (version 18.x or later recommended, because ancient tech is for history books, not your dev environment).
*   npm or yarn (your package manager of choice, no judgment here... much).

### Installation

1.  **Clone the Repository (Duh):**
    ```bash
    git clone https://your-repo-link-here.git
    cd treeweaver-project-directory
    ```
2.  **Install Dependencies (The Boring Part):**
    ```bash
    npm install
    # OR
    yarn install
    ```

### Running the App

1.  **Fire it Up!**
    ```bash
    npm run dev
    # OR
    yarn dev
    ```
2.  Open your browser and navigate to `http://localhost:8081` (or whatever port it decides to use – check your terminal, smarty pants!).

## 🛠️ How to Use This Marvel of Engineering (User Guide)

Strap in, buttercup. It's going to be a wild ride.

### 🌳 The Canvas: Your Playground (or Battlefield)

This is where the magic (and mayhem) happens.

*   **Adding Your First Victim... Err, Family Member:**
    1.  Look for the `UserPlus` (+) icon at the top-left of the canvas. Click it.
    2.  The "Node Details" panel on the right will transform into an "Add New Person" form.
    3.  Fill in the deets. A name is kinda important, just sayin'.
    4.  Hit "Add Person to Tree." Voila! They exist. Now drag them somewhere sensible.

*   **Connecting the Dots (Literally):**
    1.  Hover over a person's card on the canvas. See that little chain link (🔗) icon? Click it.
    2.  The canvas enters "linking mode." Your cursor turns into a crosshair, and a fancy line follows your mouse.
    3.  Click another person you want to connect them to.
    4.  A dialog appears: "How are [Person A] and [Person B] related?"
        *   **Parent-Child:** The person you started the link *from* becomes the parent.
        *   **Spouse:** They become spouses (aww, or yikes, depending on the family).
    5.  Choose wisely, then hit "Confirm Relationship."
    6.  Changed your mind mid-link? Press `Escape` or click the canvas background.

*   **Dragging Things Around (Because Why Not?):**
    *   Click and hold on a person's card, then drag it. Release to drop. Simple, yet satisfying.

*   **The "Make it Pretty (Maybe?)" Button (Auto-Arrange):**
    *   See the `LayoutGrid` (grid) icon at the top-left of the canvas? Click it.
    *   Our "sophisticated" algorithm will attempt to arrange your nodes into a hierarchy. Roots at the top, kids below, spouses next to each other.
    *   It tries, okay? For complex trees, "pretty" is subjective.

###  Sidebar Shenanigans: The Node Details Panel & Settings

On the right, you've got your command center for all things node-related and app-wide settings.

#### 🕵️ Node Details Panel: Spilling the Tea

Click a person on the canvas, and this panel comes alive!

*   **Editing PII (Personally Identifiable Information):**
    *   Change names, birth/death dates, gender, and add those juicy notes.
    *   Remember to hit "Save Changes" or your brilliant edits will vanish into the digital ether.
*   **Photo Fun:**
    *   Click "Upload Photo" to give someone a face. Images get resized to a glorious 500x500px.
    *   You can also paste a URL.
*   **Relationship Drama:**
    *   **Parents, Spouses, Children:** See who's connected to whom.
    *   **Add Relationship:** Click "Add Parent," "Add Spouse," or "Add Child." A dialog pops up. Select an *existing* person from your tree to link.
    *   **Remove Relationship:** Click the little `Link2Off` (broken link) icon next to a relationship. Poof! Gone.
    *   **Spouse Status:** For spouses, hover to reveal a `RefreshCw` (sync) icon. Click it to toggle between "Married" and "Divorced." Divorced couples get a stylish dotted line.
*   **Delete Person:**
    *   The big red "Delete Person" button. Use with caution. It asks for confirmation, because we're not *total* monsters.

#### ⚙️ Settings & Tools (The Cog of Destiny)

Click the `Settings` (cog) icon in the main site header (top right). A sheet slides out!

*   **Find Relationship:**
    1.  Click "Find Relationship."
    2.  The panel guides you: "Select the first person on the canvas." Do it.
    3.  "First person: [Name]. Select the second person." Do it again.
    4.  A dialog reveals their connection (or lack thereof, if they're *really* distant relatives of your imagination).
*   **Colors & Theme:**
    *   **Default Node Color:** Pick a color for nodes that aren't male, female, or deceased. Updates live!
*   **Typography:**
    *   **Node Font Family:** Choose from a curated list of fonts that probably includes something other than Papyrus. Click "Apply Visual Settings" to see the change.
*   **Layout & Structure:**
    *   **Show Profile Photos:** Toggle to show or hide those lovely (or not-so-lovely) faces on the node cards. Click "Apply Visual Settings."
*   **Node & Connector Style:**
    *   **Connector Line Thickness:** Use the slider to make lines skinny or chonky. Updates live!
*   **"Apply Visual Settings" Button:** This heroic button applies your font and photo visibility choices.

### 👑 The Header Bar: Your Royal Command Center

At the very top of the page.

*   **TreeWeaver (Logo/Name):** Click it to... well, it's a link to the homepage. You're already there. Existential.
*   **New Tree:** For when your current tree looks like a bowl of spaghetti and you just want to burn it all down (digitally, of course). Clears everything.
*   **Import JSON:** Got a previously exported TreeWeaver JSON file? Upload it here and watch your tree magically (or tragically) reappear.
*   **Export Dropdown:**
    *   **Export as JSON:** The most reliable way to save your work.
    *   **Export as PNG:** Get a picture of your canvas.
    *   **Export as PDF:** For a slightly more formal picture of your canvas.
    *   *(Other options might be disabled because, frankly, we haven't gotten around to them yet.)*

## 🎨 Customization (For the Brave and Foolhardy)

Want to get your hands dirty? Go for it. Just don't blame us if you break it.

*   **Theme Colors (`src/app/globals.css`):**
    *   This file is the heart of the color scheme. Look for CSS variables like:
        *   `--background`, `--foreground`
        *   `--primary` (used for buttons, active radio buttons, etc.) - Currently `#e9e389` (HSL `56 69% 73%`).
        *   `--accent` (used for selection rings, etc.)
        *   `--card`, `--popover`, etc.
    *   You can tweak these HSL values to your heart's content.
*   **Node Specific Colors (`src/app/globals.css`):**
    *   `--custom-theme-color-node-bg`: Fallback for nodes if no gender/deceased style applies. Set via the UI.
    *   `--node-male-bg`, `--node-male-border` (blues)
    *   `--node-female-bg`, `--node-female-border` (pinks)
    *   `--node-other-bg`, `--node-other-border` (neutral grays)
    *   `--node-deceased-bg`, `--node-deceased-border` (greys)
*   **Connector Colors (`src/app/globals.css`):**
    *   `--connector-spouse` (violet/pink)
    *   `--connector-child` (green)
    *   `--connector-default` (muted foreground)
*   **Fonts:**
    *   The main app font is Merriweather, set in `src/app/layout.tsx`.
    *   Node fonts are set via the UI and apply the `--node-font-family` CSS variable. Add more fonts to `CustomizationPanel.tsx` and ensure they are loaded if they are custom webfonts.
*   **Code Structure (A Brief Glimpse):**
    *   `/src/app/page.tsx`: The main page, holds most of the state and core logic.
    *   `/src/components/layout/`: Contains `AppLayout.tsx` (main structure) and `SiteHeader.tsx`.
    *   `/src/components/tree/`: Contains `TreeCanvas.tsx` (the interactive tree), `NodeDetailsPanel.tsx`, and `CustomizationPanel.tsx`.
    *   `/src/components/ui/`: All those lovely ShadCN UI components.
    *   `/src/lib/`: Utility functions, like `relationship-finder.ts`.
    *   `/src/types/`: TypeScript type definitions.

## 👻 Known "Features" (aka Quirks We're Pretending Are Intentional)

*   **Auto-Arrange is... Opinionated:** Our layout algorithm is trying its best. For super complex trees, it might produce "creative" arrangements. Manual dragging is your friend.
*   **Performance on Huge Trees:** If you're charting the entire history of mankind, your browser might start sweating. Keep it reasonable, folks.
*   **Image Export Imperfections:** `html2canvas` is cool, but it's not a miracle worker. Very complex node content or specific CSS might look *slightly* different in PNG/PDF exports.

## 🤝 Contributing (If You're Feeling Bold)

Found a bug? Got an idea that's less crazy than ours?
1.  Fork the repo.
2.  Create a new branch (`git checkout -b feature/your-amazing-idea`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some amazing feature'`).
5.  Push to the branch (`git push origin feature/your-amazing-idea`).
6.  Open a Pull Request. We'll try not to laugh too hard at your code (kidding!).

## 📜 Disclaimer

TreeWeaver is provided "as is." We are not responsible for any family arguments, existential crises, or sudden realizations that you're related to *that* uncle, which may arise from using this application. Use at your own risk and sense of humor.

Happy Weaving! 🕸️👨‍👩‍👧‍👦🎉
