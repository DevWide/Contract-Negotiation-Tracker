# Negotiation Tracker

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite)](https://vitejs.dev/)

A sophisticated contract negotiation tracking application designed for legal professionals, procurement teams, and business negotiators. Manage clauses, track multi-round negotiations, compare text changes, and leverage negotiation playbooks—all in a refined, intuitive interface.

<p align="center">
  <img src="client/public/images/screenshot.png" alt="Negotiation Tracker Screenshot" width="800" />
</p>

---

## ✨ Key Features

### 📋 Contract & Clause Management
- **Multi-Contract Tracking**: Manage multiple contracts simultaneously with clear organization
- **Clause-by-Clause Tracking**: Break down contracts into individual clauses for granular negotiation tracking
- **3-Text Model**: Track three versions of each clause simultaneously:
  - **Baseline Text**: The starting point (original contract or template)
  - **Their Position**: The counterparty's current proposed text
  - **Our Position**: Your current proposed text or response
- **Inline Editing**: Edit clause details directly in the table without opening separate dialogs
- **Custom Status Tracking**: Track clause status (No Changes, In Discussion, Agreed, Escalated, Blocked)

### 🔄 Multi-Round Negotiation Support
- **Round Tracking**: Keep track of negotiation rounds as proposals go back and forth
- **Version History**: Save snapshots of each negotiation round with labeled versions
- **Party Attribution**: Track whether each version came from "us" or "them"
- **Version Restore**: Roll back to previous versions when needed

### 📊 Visual Comparison & Diff
- **Side-by-Side Comparison**: Compare any two texts (Baseline ↔ Theirs, Theirs ↔ Ours, Baseline ↔ Ours)
- **Track Changes View**: See additions, deletions, and changes with Word-like formatting
- **Diff Statistics**: Instantly see how many words were added, removed, or changed
- **Full-Screen Mode**: Expand comparisons for detailed review

### 📖 Negotiation Playbook
- **Pre-defined Positions**: Create standard negotiation positions for common clause types
- **Fallback Strategies**: Document fallback positions and red lines for each topic
- **Common Objections**: Track typical counterparty objections and prepared responses
- **Clause Linking**: Link playbook topics to specific clause types for quick reference
- **Searchable Library**: Quickly find relevant guidance during negotiations

### 📄 Template Management
- **Contract Templates**: Create reusable templates with pre-defined clauses
- **Import from Documents**: Import templates from DOCX, PDF, or TXT files
- **Smart Parsing**: Automatic clause detection and structure extraction
- **Template-Based Contracts**: Start new negotiations from existing templates

### 📈 Dashboard & Analytics
- **Status Overview**: Visual dashboard showing clause status distribution
- **Completion Tracking**: Monitor negotiation progress with completion rates
- **Priority Distribution**: See clause distribution by priority level
- **Quick Filters**: Click dashboard cards to filter clauses by status

### 📅 Timeline & History
- **Negotiation Timeline**: Track key events in the negotiation lifecycle
- **Event Types**: Record meetings, document exchanges, escalations, and agreements
- **Notes & Context**: Add detailed notes to timeline events
- **Visual Timeline**: Horizontal timeline visualization of negotiation history

### 🎯 Smart Filtering & Organization
- **Multi-Filter Support**: Filter by status, priority, owner, impact category, and risk level
- **Full-Text Search**: Search across clause numbers, issues, and text content
- **Custom Columns**: Configure which columns to display and in what order
- **Sortable Columns**: Click column headers to sort by any field

### 🌓 User Experience
- **Light & Dark Mode**: Switch between light and dark themes
- **Keyboard Shortcuts**: Use `Ctrl+N` (new clause), `Escape` (close dialogs), and more
- **Responsive Design**: Works on desktop and tablet devices
- **Guided Onboarding**: Welcome tour for new users
- **Contextual Help**: Help widget with quick tips and keyboard shortcuts

### 📥 Import & Export
- **CSV Import**: Import clauses from CSV files
- **CSV Export**: Export contract data to CSV for spreadsheets
- **JSON Export**: Full contract export to JSON format
- **Document Import**: Parse clauses from DOCX

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** package manager (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gianni-pv/Contract-Negotiation-Tracker.git
   cd Contract-Negotiation-Tracker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open the app**
   
   Navigate to `http://localhost:3000` in your browser

### Building for Production

```bash
pnpm build
```

The production build will be output to the `dist/` directory.

### Running in Production

```bash
pnpm start
```

---

## 📖 How to Use

### Creating Your First Contract

1. **Click "Create Contract"** from the empty state or use the dropdown in the header
2. **Fill in contract details**:
   - **Name**: A descriptive name for the contract
   - **Counterparty**: The other party in the negotiation
   - **Description**: Brief context about the contract
   - **Paper Source**: Select "Our Paper" if starting from your template, or "Counterparty's Paper" if reviewing their document

### Adding Clauses

1. **Click "Add Clause"** button above the clause table
2. **Fill in clause details**:
   - **Clause Number**: Reference number (e.g., "1.1", "2.3a")
   - **Topic**: The clause category (e.g., "Liability", "Payment Terms")
   - **Issue**: What's being negotiated
   - **Baseline Text**: The starting point text
   - **Their Position**: Counterparty's proposed changes
   - **Our Position**: Your proposed response
3. **Set metadata**: Status, priority, owner, risk level, and impact category

### Using the 3-Text Comparison

1. **Click the compare icon** (↔) on any clause row
2. **Select comparison pair**:
   - **Baseline ↔ Theirs**: See what the counterparty changed
   - **Theirs ↔ Ours**: See where you disagree
   - **Baseline ↔ Ours**: See total deviation from the original
3. **Toggle view modes**: Switch between inline diff and side-by-side comparison

### Managing Negotiation Rounds

1. **Open the comparison modal** for a clause
2. **Go to "Version History" tab**
3. **Save a version** with a label (e.g., "Round 2 - Their Markup")
4. **Track party attribution**: Mark versions as "Our Counter" or "Their Proposal"
5. **Restore versions**: Roll back to any previous version if needed

### Using the Playbook

1. **Expand the Playbook panel** on the home page
2. **Browse topics** by category or use the search
3. **View positions**: See standard positions, fallbacks, and common objections
4. **Link to clauses**: Open playbook guidance directly from a clause's context menu

### Working with Templates

1. **Click your avatar** → **"Templates"** from the header
2. **Create a new template** manually or import from a document
3. **Add template clauses** with standard positions and guidance
4. **Use templates**: When creating a new contract, choose to start from a template

### Tracking Timeline Events

1. **Expand the Timeline section** on the contract page
2. **Add events**: Click the "+" button to log meetings, document exchanges, etc.
3. **Add notes**: Include detailed context for each event
4. **Review history**: Click events to view or edit details

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI primitives
- **State Management**: React Context + custom hooks
- **Storage**: LocalStorage (client-side persistence)
- **Document Parsing**: JSZip (DOCX), PDF.js (PDF)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## 📁 Project Structure

```
negotiation-tracker/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── ui/           # Base UI primitives (shadcn/ui)
│   │   │   └── onboarding/   # Onboarding components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utility functions
│   │   ├── pages/            # Page components
│   │   ├── types/            # TypeScript definitions
│   │   └── data/             # Sample data
│   └── public/               # Static assets
├── server/                    # Express server (optional)
├── shared/                    # Shared constants
└── Docs/                      # Documentation
```

---

## 🔧 Configuration

### Environment Variables

No environment variables are required for basic usage. The app uses browser localStorage for persistence.

### Customizing Impact Categories

Impact categories can be customized in the Settings modal:
1. Click your avatar → Settings
2. Navigate to "Impact Categories"
3. Add, edit, or remove categories and subcategories

### Customizing Owners

Team members (owners) can be added dynamically when creating or editing clauses, or managed in Settings.

---

## 📊 Data Persistence

All data is stored locally in the browser using localStorage:
- **Contracts & Clauses**: `negotiation-tracker-contracts`
- **Templates**: `negotiation-tracker-templates`
- **Playbook Topics**: `negotiation-tracker-playbook`
- **Column Configuration**: `negotiation-tracker-columns`
- **Impact Categories**: `negotiation-tracker-impact-categories`

To export your data for backup, use the Export feature in the contract dropdown menu.

---

## 🤝 Contributing

We welcome feedback, bug reports, and feature discussions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

**Note:** Pull requests are currently not being accepted. See CONTRIBUTING.md for more information.

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This means:
- ✅ You can use, modify, and distribute this software
- ✅ You can use it for commercial purposes
- ✅ You can fork and create derivative works
- ⚠️ **If you modify this software and run it as a network service (SaaS), you must release your source code under AGPL-3.0**
- ⚠️ All derivative works must also be licensed under AGPL-3.0

See the [LICENSE](LICENSE) file for the full license text.

---

## 👤 Author

© 2026 Gianni Carfi Pavia. All rights reserved.

---

## 💼 Commercial Licensing

For commercial licensing inquiries or enterprise deployments, please contact the author.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Lucide](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
