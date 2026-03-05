import { useState } from "react";
import { Search, Grid3X3, List, ArrowLeft, Calendar, Clock, Tag, Share2, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BlogPost {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  category: string;
  readTime: string;
  imageColor: string;
  imagePattern?: string;
  content?: string;
  author?: string;
}

function PatternSvg({ pattern }: { pattern: string }) {
  const patterns: Record<string, JSX.Element> = {
    chart: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <path d="M40,110 Q60,60 80,90 T120,70 T160,50" fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="80" cy="90" r="4" fill="#1a1a1a" />
        <circle cx="120" cy="70" r="4" fill="#1a1a1a" />
        <path d="M140,40 L150,30 M150,40 L160,30" stroke="#1a1a1a" strokeWidth="2" />
      </svg>
    ),
    stairs: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <path d="M60,120 L60,90 L90,90 L90,60 L120,60 L120,30" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <path d="M130,40 Q140,30 150,40" fill="none" stroke="#fff" strokeWidth="2" />
      </svg>
    ),
    book: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect x="50" y="30" width="100" height="90" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <line x1="80" y1="30" x2="80" y2="120" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="95" y1="50" x2="130" y2="50" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="95" y1="65" x2="130" y2="65" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="95" y1="80" x2="120" y2="80" stroke="#1a1a1a" strokeWidth="2" />
      </svg>
    ),
    code: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <path d="M70,75 L50,55 L70,35" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M130,75 L150,55 L130,35" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="85" y1="85" x2="115" y2="25" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <ellipse cx="100" cy="75" rx="50" ry="30" fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="100" cy="75" r="15" fill="#1a1a1a" />
        <path d="M150,45 L170,35" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
        <path d="M155,55 L175,50" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    nodes: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <circle cx="60" cy="75" r="12" fill="#1a1a1a" />
        <circle cx="140" cy="50" r="12" fill="#1a1a1a" />
        <circle cx="140" cy="100" r="12" fill="#1a1a1a" />
        <line x1="72" y1="75" x2="128" y2="55" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="72" y1="75" x2="128" y2="95" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="140" cy="50" r="4" fill="#fff" />
        <circle cx="140" cy="100" r="4" fill="#fff" />
      </svg>
    ),
  };
  return patterns[pattern] || null;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Introducing Weave Studio: A New Era of Visual Development",
    subtitle: "We're rebranding from Meshwork Studio to Weave Studio, bringing you the same powerful canvas experience with a fresh identity.",
    date: "Mar 5, 2026",
    category: "Announcements",
    readTime: "4 min read",
    imageColor: "bg-[#E8DED5]",
    imagePattern: "nodes",
    author: "The Weave Team",
    content: `
Today marks a significant milestone for our team. After months of reflection and growth, we're excited to announce that Meshwork Studio is now **Weave Studio**.

## Why the Change?

As our platform evolved from a simple node editor to a comprehensive visual development environment, we realized our name needed to reflect that transformation. "Weave" captures what our users do best - weaving together ideas, data, and workflows into cohesive applications.

## What's New

- **Refreshed Brand Identity**: New logo, color palette, and visual language
- **Enhanced Canvas Engine**: 40% faster rendering with our new WebGL-based renderer
- **Improved Collaboration**: Real-time cursors and live editing with your team
- **Smart Workspaces**: AI-powered suggestions for node connections

## What Stays the Same

Your existing projects, workspaces, and workflows remain untouched. All URLs redirect seamlessly, and your data is exactly where you left it. The core experience you love - infinite canvas, flexible nodes, rapid prototyping - only gets better.

## Looking Ahead

This rebrand signals our commitment to becoming the definitive visual development platform. Over the coming months, expect:

- Component marketplace for sharing and discovering node templates
- Enhanced integrations with popular databases and APIs
- Mobile companion app for on-the-go project monitoring

Thank you for being part of this journey. We can't wait to see what you weave next.
    `
  },
  {
    id: 2,
    title: "Building Real-time Collaborative Canvas Editing",
    subtitle: "How we implemented WebSockets for live node synchronization across multiple users.",
    date: "Feb 28, 2026",
    category: "Engineering",
    readTime: "12 min read",
    imageColor: "bg-[#7A8B6E]",
    imagePattern: "stairs",
    author: "Sarah Chen",
    content: `
Real-time collaboration is the holy grail of canvas-based applications. Here's how we built ours.

## The Challenge

When multiple users edit the same canvas simultaneously, conflicts are inevitable. Traditional CRDTs (Conflict-free Replicated Data Types) work well for text, but canvas operations - moving nodes, resizing, creating connections - require a different approach.

## Our Architecture

We implemented an **Operational Transformation** system specifically designed for spatial data:

### 1. Operation Primitives
Every canvas action becomes a typed operation:
- NodeMove - position changes
- NodeResize - dimension changes  
- EdgeCreate - connection creation
- StyleUpdate - visual property changes

### 2. Conflict Resolution
Operations carry metadata about their spatial context. When conflicts occur, we resolve based on:
- **Temporal ordering**: Wall-clock timestamps
- **User priority**: Explicit locks on high-level structural changes
- **Spatial proximity**: Operations affecting different canvas regions can coexist

### 3. Presence System
Beyond just data sync, we track:
- Cursor positions with smooth interpolation
- User viewport awareness (who's looking where)
- Selection state broadcasting

## Performance Optimizations

- **Delta compression**: Only changed properties transmitted
- **Spatial indexing**: Operations filtered by viewport before transmission
- **Debounce with prediction**: Local changes appear immediately, server reconciliation happens in background

## The Result

Sub-50ms latency for all collaborative operations, even with 20+ concurrent editors. The canvas feels local even when shared globally.
    `
  },
  {
    id: 3,
    title: "Node System Architecture Deep Dive",
    subtitle: "Lessons learned building a flexible node editor with React Flow and custom handles.",
    date: "Feb 20, 2026",
    category: "Technical",
    readTime: "15 min read",
    imageColor: "bg-[#D4846A]",
    imagePattern: "book",
    author: "Marcus Johnson",
    content: `
When we started Weave Studio, we chose React Flow as our foundation. Two years later, we've learned a lot about extending and customizing node editors.

## Why React Flow?

We evaluated several options:
- **Rete.js**: Powerful but complex API surface
- **BaklavaJS**: Vue-based, not suitable for our React stack
- **Flowchart.js**: Too limited for our use cases
- **React Flow**: Best balance of flexibility and sane defaults

## Custom Node Types

Our nodes aren't just boxes. We support:

### Data Nodes
- Database connectors (PostgreSQL, MongoDB, Redis)
- API endpoints with configurable methods
- File system watchers

### Logic Nodes  
- Conditional branching with visual flow
- Loop constructs with iteration tracking
- Function definition and reuse

### UI Nodes
- Form builders with drag-and-drop fields
- Chart components with live data binding
- Layout containers with responsive behavior

## Handle System

Standard React Flow uses simple source/target handles. We extended this:

- **Typed connections**: Prevents connecting incompatible data types
- **Multi-handles**: Single node with many inputs/outputs
- **Dynamic handles**: Handles appear/disappear based on configuration
- **Custom handle shapes**: Visual distinction between data types

## Performance at Scale

Our largest user has a canvas with 2,000+ nodes. Here's how we maintain 60fps:

1. **Virtualization**: Only visible nodes rendered to DOM
2. **Web Workers**: Heavy computation (data validation, transformation) offloaded
3. **Debounced State Updates**: Batch rapid changes into single renders
4. **Memoized Components**: Strict memoization prevents unnecessary re-renders

## The Future

We're extracting our node system into a standalone library. If you're building node-based interfaces, stay tuned.
    `
  },
  {
    id: 4,
    title: "Export to PNG, PDF, and JSON",
    subtitle: "Rendering canvas to multiple formats using html2canvas and jsPDF.",
    date: "Feb 12, 2026",
    category: "Features",
    readTime: "8 min read",
    imageColor: "bg-[#B8C5C4]",
    imagePattern: "code",
    author: "Emily Park",
    content: `
Export functionality bridges the gap between your canvas workspace and the rest of your workflow. Here's how we built ours.

## PNG Export

For quick sharing and documentation:

- **Resolution scaling**: Export at 1x, 2x, or 3x for crisp displays
- **Selection export**: Export just selected nodes or entire canvas
- **Transparent backgrounds**: Optional transparency for overlay use
- **Annotation overlay**: Include or hide UI elements like grid lines

Implementation uses html2canvas with custom element rendering for our node types.

## PDF Export

For formal documentation and presentations:

- **Multi-page**: Large canvases automatically paginate
- **Vector quality**: Text and shapes remain crisp at any zoom
- **Clickable links**: Node hyperlinks preserved in output
- **Custom headers**: Add project name, date, page numbers

Built on jsPDF with custom SVG-to-PDF conversion for node graphics.

## JSON Export

For programmatic access and backups:

- **Complete state**: All node positions, connections, and configurations
- **Schema versioned**: Forward and backward compatibility handled
- **Selective export**: Export subsets of nodes with dependency resolution
- **Minified or pretty**: Choose output format based on use case

## Import Compatibility

All exports are reversible:
- PNG → re-import as image node
- PDF → not re-importable but preserves visual state
- JSON → full round-trip, pick up exactly where you left off

## Coming Soon

- **Figma import**: Bring your designs into Weave Studio
- **Mermaid export**: Generate flowchart code from your canvas
- **Git integration**: Version control for your JSON exports
    `
  },
  {
    id: 5,
    title: "Workspace Management at Scale",
    subtitle: "New features for organizing projects: collections, tags, and bulk operations.",
    date: "Feb 5, 2026",
    category: "Product",
    readTime: "6 min read",
    imageColor: "bg-[#C4A77D]",
    imagePattern: "eye",
    author: "Alex Rivera",
    content: `
When you have dozens of workspaces, organization becomes critical. Here's how our new management features help.

## Collections

Group related workspaces into collections:
- **Nested folders**: Unlimited depth for complex hierarchies
- **Shared permissions**: Grant access to entire collections at once
- **Collection templates**: New workspaces inherit collection defaults
- **Bulk actions**: Move, copy, or delete entire collections

## Tags

Cross-cutting organization beyond hierarchy:
- **Color-coded**: Visual distinction at a glance
- **Searchable**: Filter workspaces by any tag combination
- **Auto-suggestions**: Frequently used tags suggested
- **Tag analytics**: See which tags are most used across your team

## Bulk Operations

Save time with multi-select:
- **Select all/none**: One-click selection management
- **Shift-select**: Range selection like your file manager
- **Bulk move**: Reorganize multiple workspaces at once
- **Bulk export**: Download multiple workspaces as zip archive

## Search & Filter

Find workspaces instantly:
- **Full-text search**: Matches titles, descriptions, and node content
- **Date filters**: Find workspaces by creation or modification date
- **Type filters**: Show only API workflows, UI mockups, etc.
- **Recent**: Quick access to your most visited workspaces

## Archiving

Not ready to delete, but don't need it cluttering your view?
- Archive workspaces to remove from main view
- Archived workspaces searchable but hidden by default
- One-click restore when needed
- Automatic archiving after period of inactivity (configurable)

## Team Features

For organizations:
- **Shared collections**: Team-wide project organization
- **Workspace requests**: Request access to any workspace
- **Activity feed**: See what teammates are working on
- **Usage analytics**: Understand team workspace patterns
    `
  },
  {
    id: 6,
    title: "Designing for Spatial Thinking",
    subtitle: "Why we chose an infinite canvas over traditional linear interfaces.",
    date: "Jan 28, 2026",
    category: "Design",
    readTime: "7 min read",
    imageColor: "bg-[#9B8B7A]",
    imagePattern: "chart",
    author: "Jordan Lee",
    content: `
The human brain didn't evolve to think in lists. It evolved to think in spaces. That's why we built Weave Studio on an infinite canvas.

## The Problem with Linear Interfaces

Traditional development tools force linear thinking:
- Files in directories (tree structures)
- Code in sequence (top to bottom)
- Navigation through breadcrumbs and menus

This doesn't match how we naturally organize complex ideas. Research shows spatial memory is far more powerful than symbolic memory for complex systems.

## Canvas as Cognition

An infinite canvas mirrors how we think:
- **Proximity = relationship**: Things near each other are related
- **Visual patterns**: Shapes and colors convey meaning instantly  
- **Zoom levels**: Detail when needed, overview when planning
- **Multiple paths**: No forced navigation order

## Scientific Backing

Studies consistently show:
- Spatial interfaces reduce cognitive load by 40% for complex tasks
- Users remember location of information 3x better than menu paths
- Parallel exploration leads to more creative solutions
- Visual grouping improves problem decomposition

## Our Design Principles

1. **Infinite, not bounded**: Never run out of space
2. **Zoom, not scroll**: Navigate by zooming to relevant scale
3. **Direct manipulation**: Touch and move, don't navigate menus
4. **Visual persistence**: Things stay where you put them
5. **Context preservation**: See related work while focused on details

## Real User Impact

Beta testers reported:
- "I can hold the entire system in my head now"
- "Finding that one API endpoint takes seconds, not minutes"
- "My team understands my architecture during code review"
- "I spot connections I would have missed in code"

## Trade-offs

Canvas isn't perfect for everything:
- Simple linear workflows might prefer traditional forms
- Keyboard-heavy users need additional shortcuts
- Accessibility requires extra care

We're addressing these with hybrid modes and enhanced accessibility features.

## The Future is Spatial

We believe spatial interfaces will become the norm for complex creative work. Weave Studio is our bet on that future.
    `
  }
];

export default function Dev() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Announcements", "Engineering", "Technical", "Features", "Product", "Design"];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedPost) {
    return (
      <div className="min-h-screen relative">
        {/* Blog post background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_31px,currentColor_31px,currentColor_32px)] opacity-[0.02]" />
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-radial from-indigo-500/5 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button 
            variant="ghost" 
            className="mb-8 -ml-4 text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedPost(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to blog
          </Button>

          {/* Article header */}
          <article className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                  {selectedPost.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedPost.readTime}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight">
                {selectedPost.title}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {selectedPost.subtitle}
              </p>

              {selectedPost.author && (
                <div className="flex items-center gap-3 pt-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                    {selectedPost.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{selectedPost.author}</p>
                    <p className="text-sm text-muted-foreground">Weave Studio Team</p>
                  </div>
                </div>
              )}
            </div>

            {/* Featured image */}
            <div className={cn("w-full h-64 md:h-96 rounded-2xl", selectedPost.imageColor)} />

            {/* Article content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="space-y-6 text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {selectedPost.content?.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={idx} className="text-2xl font-bold mt-12 mb-4">{paragraph.replace('## ', '')}</h2>;
                  }
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={idx} className="text-xl font-semibold mt-8 mb-3">{paragraph.replace('### ', '')}</h3>;
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={idx} className="list-disc list-inside space-y-2 ml-4">
                        {paragraph.split('\n').map((item, i) => (
                          <li key={i}>{item.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.startsWith('1. ')) {
                    return (
                      <ol key={idx} className="list-decimal list-inside space-y-2 ml-4">
                        {paragraph.split('\n').map((item, i) => (
                          <li key={i}>{item.replace(/^\d+\. /, '')}</li>
                        ))}
                      </ol>
                    );
                  }
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <p key={idx} className="font-semibold text-lg">{paragraph.replace(/\*\*/g, '')}</p>;
                  }
                  if (paragraph.includes('`')) {
                    return (
                      <p key={idx}>
                        {paragraph.split('`').map((part, i) => 
                          i % 2 === 1 ? (
                            <code key={i} className="px-2 py-1 bg-muted rounded text-sm font-mono">{part}</code>
                          ) : part
                        )}
                      </p>
                    );
                  }
                  return <p key={idx}>{paragraph}</p>;
                })}
              </div>
            </div>

            {/* Share section */}
            <div className="border-t pt-8 mt-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Link2 className="w-4 h-4" />
                    Copy link
                  </Button>
                </div>
                <Button variant="ghost" onClick={() => setSelectedPost(null)}>
                  Back to all posts
                </Button>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      {/* Dev blog background - fixed to cover full viewport */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_31px,currentColor_31px,currentColor_32px)] opacity-[0.02]" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-radial from-indigo-500/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-emerald-500/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header with search */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-card rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="w-48 shrink-0 hidden lg:block">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-4 font-sans">Categories</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedCategory === category 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Blog Grid/List with smooth transition */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="group cursor-pointer bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-lg"
                  >
                    <div className={cn("h-48 w-full flex items-center justify-center p-8", post.imageColor)}>
                      {post.imagePattern && <PatternSvg pattern={post.imagePattern} />}
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Tag className="w-3 h-3" />
                        {post.category}
                        <span>·</span>
                        {post.readTime}
                      </div>
                      <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.subtitle}
                      </p>
                      <p className="text-xs text-muted-foreground pt-2">
                        {post.date}
                      </p>
                    </div>
                  </article>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-4"
              >
                {filteredPosts.map((post) => (
                  <div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className="flex gap-4 p-4 bg-card rounded-xl group cursor-pointer hover:bg-muted/50 transition-colors border border-border hover:border-primary/50"
                  >
                    <div className={cn("w-32 h-24 rounded-lg shrink-0 flex items-center justify-center p-4", post.imageColor)}>
                      {post.imagePattern && <PatternSvg pattern={post.imagePattern} />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Tag className="w-3 h-3" />
                        {post.category}
                        <span>·</span>
                        {post.date}
                        <span>·</span>
                        {post.readTime}
                      </div>
                      <h3 className="font-display font-semibold group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-sans line-clamp-2">
                        {post.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
