import { useState } from "react";
import { Search, Grid3X3, List, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  category: string;
  readTime: string;
  imageColor: string;
  imagePattern?: string;
}

const fakePosts: BlogPost[] = [
  {
    id: 1,
    title: "Building real-time collaborative canvas editing",
    subtitle: "How we implemented WebSockets for live node synchronization across multiple users.",
    date: "Mar 3, 2026",
    category: "Engineering",
    readTime: "8 min read",
    imageColor: "bg-[#E8DED5]",
    imagePattern: "nodes"
  },
  {
    id: 2,
    title: "Node system architecture deep dive",
    subtitle: "Lessons learned building a flexible node editor with React Flow and custom handles.",
    date: "Feb 24, 2026",
    category: "Technical",
    readTime: "12 min read",
    imageColor: "bg-[#7A8B6E]",
    imagePattern: "stairs"
  },
  {
    id: 3,
    title: "Workspace management at scale",
    subtitle: "New features for organizing projects: collections, tags, and bulk operations.",
    date: "Feb 18, 2026",
    category: "Product",
    readTime: "5 min read",
    imageColor: "bg-[#D4846A]",
    imagePattern: "book"
  },
  {
    id: 4,
    title: "Export to PNG, PDF, and JSON",
    subtitle: "Rendering canvas to multiple formats using html2canvas and jsPDF.",
    date: "Feb 12, 2026",
    category: "Features",
    readTime: "6 min read",
    imageColor: "bg-[#B8C5C4]",
    imagePattern: "code"
  },
  {
    id: 5,
    title: "Designing for spatial thinking",
    subtitle: "Why we chose an infinite canvas over traditional linear interfaces.",
    date: "Feb 5, 2026",
    category: "Design",
    readTime: "7 min read",
    imageColor: "bg-[#C4A77D]",
    imagePattern: "eye"
  },
  {
    id: 6,
    title: "Introducing Meshwork Studio 1.0",
    subtitle: "A complete rebuild with faster rendering, better UX, and enterprise features.",
    date: "Jan 28, 2026",
    category: "Announcements",
    readTime: "4 min read",
    imageColor: "bg-[#9B8B7A]",
    imagePattern: "chart"
  }
];

const filters = [
  { label: "Sort by", options: ["Newest", "Oldest", "Popular"] },
  { label: "Category", options: ["All", "Engineering", "Technical", "Product", "Features", "Design", "Announcements"] },
  { label: "Product", options: ["All", "Meshwork Studio", "Canvas", "Workspace", "API"] },
];

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
        <path d="M140,50 Q150,40 160,50" fill="none" stroke="#fff" strokeWidth="2" />
      </svg>
    ),
    book: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect x="60" y="40" width="80" height="70" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <line x1="100" y1="40" x2="100" y2="110" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="75" cy="65" r="4" fill="#1a1a1a" />
        <circle cx="125" cy="85" r="4" fill="#1a1a1a" />
        <path d="M75,65 L125,85" stroke="#1a1a1a" strokeWidth="2" />
      </svg>
    ),
    code: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <path d="M70,75 L50,85 L70,95" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
        <path d="M130,75 L150,85 L130,95" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
        <path d="M85,105 L115,65" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <ellipse cx="100" cy="75" rx="40" ry="25" fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="100" cy="75" r="12" fill="#1a1a1a" />
        <path d="M140,75 L160,65 M155,75 L165,70" stroke="#1a1a1a" strokeWidth="2" />
      </svg>
    ),
    nodes: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <circle cx="70" cy="75" r="8" fill="#1a1a1a" />
        <circle cx="130" cy="55" r="8" fill="#1a1a1a" />
        <circle cx="130" cy="95" r="8" fill="#1a1a1a" />
        <line x1="78" y1="75" x2="122" y2="55" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="78" y1="75" x2="122" y2="95" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="100" cy="35" r="6" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="100" y1="41" x2="100" y2="55" stroke="#1a1a1a" strokeWidth="2" />
      </svg>
    )
  };
  return patterns[pattern] || null;
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group cursor-pointer">
      {/* Image */}
      <div className={cn("aspect-[4/3] rounded-xl overflow-hidden mb-4 relative", post.imageColor)}>
        <div className="absolute inset-0 flex items-center justify-center p-8 opacity-60 group-hover:opacity-80 transition-opacity">
          <PatternSvg pattern={post.imagePattern || "chart"} />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-sans">{post.date}</p>
        <h3 className="text-lg font-display font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground font-sans line-clamp-2 leading-relaxed">
          {post.subtitle}
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Tag className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-sans">{post.category}</span>
        </div>
      </div>
    </article>
  );
}

export default function DevPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = fakePosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header with search */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search posts"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-card border-0 rounded-lg font-sans"
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
              <h4 className="text-sm font-semibold mb-4 font-sans">Filter and sort</h4>
              <div className="space-y-4">
                {filters.map((filter) => (
                  <div key={filter.label} className="space-y-2">
                    <label className="text-xs text-muted-foreground font-sans">{filter.label}</label>
                    <select className="w-full bg-transparent text-sm font-sans border-0 border-b border-border rounded-none pb-2 focus:ring-0 focus:border-primary cursor-pointer">
                      {filter.options.map((option) => (
                        <option key={option} value={option.toLowerCase()}>{option}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Blog Grid */}
        <div className="flex-1">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="flex gap-4 p-4 bg-card rounded-xl group cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className={cn("w-32 h-24 rounded-lg shrink-0", post.imageColor)} />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-muted-foreground font-sans">{post.date}</p>
                    <h3 className="font-display font-semibold group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans line-clamp-2">
                      {post.subtitle}
                    </p>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="text-xs text-muted-foreground font-sans">{post.category}</span>
                      <span className="text-xs text-muted-foreground font-sans">{post.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
