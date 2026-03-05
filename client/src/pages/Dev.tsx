import { useToast } from "@/hooks/use-toast";
import { GitBranch, Bug, Lightbulb, Terminal } from "lucide-react";

export default function DevPage() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-10 pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-foreground leading-[0.85]">
          Dev<br />Documentation
        </h1>
        <p className="mt-6 text-xl font-bold uppercase tracking-widest border-l-4 border-foreground pl-4 ml-2 max-w-md">
          System logs, changelog, and technical notes
        </p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Changelog Section */}
          <div className="brutal-card bg-card p-6 border-2 border-foreground">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center">
                <GitBranch className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Changelog</h2>
            </div>
            <div className="space-y-4">
              <div className="border-l-2 border-primary pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">v1.0.0</span>
                  <span className="text-xs text-muted-foreground">2026-03-05</span>
                </div>
                <ul className="text-sm space-y-1 text-foreground">
                  <li>• Initial release with workspace management</li>
                  <li>• Canvas node editor with real-time sync</li>
                  <li>• User authentication and sessions</li>
                  <li>• Multi-delete functionality</li>
                </ul>
              </div>
              <div className="border-l-2 border-muted-foreground pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">v0.9.0</span>
                  <span className="text-xs text-muted-foreground">2026-03-01</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Beta testing release</li>
                  <li>• Bug fixes and performance improvements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Known Issues */}
          <div className="brutal-card bg-card p-6 border-2 border-foreground">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-destructive text-destructive-foreground flex items-center justify-center">
                <Bug className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Known Issues</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-destructive mt-2 shrink-0" />
                <span className="text-sm">Canvas zoom can be jumpy on trackpads</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-yellow-500 mt-2 shrink-0" />
                <span className="text-sm">Edge connections sometimes don't snap properly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-muted-foreground mt-2 shrink-0" />
                <span className="text-sm">Large workspaces may load slowly</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="brutal-card bg-card p-6 border-2 border-foreground">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Tech Stack</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Frontend</h3>
                <ul className="text-sm space-y-1">
                  <li>• React + TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Vite</li>
                  <li>• React Flow</li>
                </ul>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Backend</h3>
                <ul className="text-sm space-y-1">
                  <li>• Node.js + Express</li>
                  <li>• PostgreSQL</li>
                  <li>• Drizzle ORM</li>
                  <li>• Passport.js</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Roadmap */}
          <div className="brutal-card bg-card p-6 border-2 border-foreground">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Roadmap</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-primary mt-2 shrink-0" />
                <span className="text-sm">Collaborative editing with WebSockets</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-primary mt-2 shrink-0" />
                <span className="text-sm">Export to PNG/PDF</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-muted-foreground mt-2 shrink-0" />
                <span className="text-sm">AI-powered layout suggestions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-muted-foreground mt-2 shrink-0" />
                <span className="text-sm">Mobile app version</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
