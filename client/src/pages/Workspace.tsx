import { useCallback, useEffect, useState, useRef } from 'react';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Node,
    type Edge,
    type Connection,
    Panel,
    useReactFlow,
    ConnectionMode,
    ReactFlowProvider,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useCanvas } from '@/hooks/use-canvas';
import { useParams, Link } from 'wouter';
import {
    Save,
    Loader2,
    Play,
    ChevronLeft,
    Layers as LayersIcon,
    MousePointer2,
    Square,
    Type,
    Share2,
    Settings,
    HelpCircle,
    Server,
    Database,
    Cpu,
    Globe,
    MessageSquare,
    HardDrive,
    Zap,
    Plus,
    Box,
    Trash2,
    Copy,
    Edit2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SystemNode } from '@/components/canvas/nodes/SystemNode';

const nodeTypes = {
    server: SystemNode,
    database: SystemNode,
    loadBalancer: SystemNode,
    gateway: SystemNode,
    queue: SystemNode,
    storage: SystemNode,
    logic: SystemNode,
};

const nodeTypesList = [
    { type: 'server', label: 'Server', icon: Server },
    { type: 'database', label: 'Database', icon: Database },
    { type: 'loadBalancer', label: 'Load Balancer', icon: Cpu },
    { type: 'gateway', label: 'API Gateway', icon: Globe },
    { type: 'queue', label: 'Message Queue', icon: MessageSquare },
    { type: 'storage', label: 'Object Storage', icon: HardDrive },
    { type: 'logic', label: 'Lambda/Logic', icon: Zap },
];

function WorkspaceView() {
    const { id } = useParams();
    const workspaceId = Number(id);
    const { data: canvasData, isLoading, sync, isSyncing } = useCanvas(workspaceId);
    const { user } = useAuth();
    const { toast } = useToast();
    const { screenToFlowPosition } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'layers' | 'properties'>('layers');
    const [isSimulating, setIsSimulating] = useState(false);

    // Context Menu State
    const [menu, setMenu] = useState<{ id: string; top: number; left: number; type: 'node' | 'pane' } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (canvasData) {
            setNodes(canvasData.nodes || []);
            setEdges(canvasData.edges || []);
        }
    }, [canvasData, setNodes, setEdges]);

    // Handle Simulation Edge Animation
    useEffect(() => {
        setEdges((eds) =>
            eds.map((edge) => ({
                ...edge,
                animated: isSimulating,
                style: isSimulating ? { stroke: '#FFFFFF', strokeWidth: 2 } : { stroke: '#444' },
            }))
        );
    }, [isSimulating, setEdges]);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = () => setMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({
            ...params,
            style: { stroke: '#444' },
            animated: isSimulating
        }, eds)),
        [setEdges, isSimulating],
    );

    const handleSave = () => {
        sync({ nodes, edges }, {
            onSuccess: () => {
                toast({
                    title: "Architecture Saved",
                    description: "Distributed system config persisted.",
                });
            }
        });
    };

    const addNode = (type: string, label: string, position = { x: 100, y: 100 }) => {
        const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type,
            position,
            data: { label: label },
        };
        setNodes((nds) => nds.concat(newNode));
        return newNode;
    };

    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: Node) => {
            event.preventDefault();
            setMenu({
                id: node.id,
                top: event.clientY,
                left: event.clientX,
                type: 'node',
            });
        },
        [setMenu]
    );

    const onPaneContextMenu = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            setMenu({
                id: 'pane',
                top: event.clientY,
                left: event.clientX,
                type: 'pane',
            });
        },
        [setMenu]
    );

    const deleteNode = useCallback(
        (id: string) => {
            setNodes((nds) => nds.filter((node) => node.id !== id));
            setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
            if (selectedNodeId === id) setSelectedNodeId(null);
        },
        [setNodes, setEdges, selectedNodeId]
    );

    const duplicateNode = useCallback(
        (id: string) => {
            const node = nodes.find((n) => n.id === id);
            if (node) {
                const newNode = {
                    ...node,
                    id: `${node.id}-copy-${Date.now()}`,
                    position: { x: node.position.x + 20, y: node.position.y + 20 },
                    selected: false,
                };
                setNodes((nds) => nds.concat(newNode));
            }
        },
        [nodes, setNodes]
    );

    const onNodeClick = useCallback((_: any, node: Node) => {
        setSelectedNodeId(node.id);
        setActiveTab('properties');
    }, []);

    const updateNodeData = (id: string, label: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, label } };
                }
                return node;
            })
        );
    };

    const updateNodeStyle = (id: string, border: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, style: { ...node.style, border } };
                }
                return node;
            })
        );
    };

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#000000]">
                <Loader2 className="w-8 h-8 animate-spin text-white/10" />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#000000] font-sans text-sm selection:bg-white/10 text-white">
            {/* Monochrome Figma Header */}
            <header className="h-12 border-b border-white/5 bg-[#121212] flex items-center justify-between px-3 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="hover:bg-white/5 p-1.5 rounded-md transition-colors text-white/50 hover:text-white">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-4 w-px bg-white/10 mx-1" />
                    <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-white/70" />
                        <span className="font-medium text-white/90">Nexus Visualizer</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleSave} disabled={isSyncing} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/5 transition-all text-white/80 font-medium text-xs">
                        {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save Architecture
                    </button>
                    <div className="h-4 w-px bg-white/10 mx-1" />
                    <Avatar className="w-7 h-7 ring-1 ring-white/10">
                        <AvatarImage src={user?.profileImageUrl} />
                        <AvatarFallback className="bg-white/5 text-white/50 text-[10px] font-bold">{user?.firstName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {/* LEFT SIDEBAR: Components (Node Library) */}
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="hidden md:block">
                        <aside className="h-full border-r border-white/5 bg-[#121212] flex flex-col z-40">
                            <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
                                <span className="font-bold text-[10px] uppercase tracking-widest text-white/30">Library</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                                <section>
                                    <h3 className="text-[10px] font-bold uppercase text-white/20 mb-3 ml-1 tracking-widest">Infrastructure</h3>
                                    <div className="grid grid-cols-1 gap-1">
                                        {nodeTypesList.map((item) => (
                                            <button
                                                key={item.type}
                                                onClick={() => addNode(item.type, item.label)}
                                                className="flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all text-left group"
                                            >
                                                <div className="p-1.5 rounded-md bg-white/5 text-white/60 group-hover:text-white group-hover:bg-white/10 transition-colors">
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-[12px] font-medium text-white/70 group-hover:text-white">{item.label}</span>
                                                <Plus className="w-3 h-3 ml-auto text-white/0 group-hover:text-white/20" />
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </aside>
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-white/5" />

                    {/* Canvas Area */}
                    <ResizablePanel defaultSize={60}>
                        <main className="h-full relative bg-[#000000]">
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onNodeClick={onNodeClick}
                                onNodeContextMenu={onNodeContextMenu}
                                onPaneContextMenu={onPaneContextMenu as any}
                                nodeTypes={nodeTypes}
                                fitView
                                colorMode="dark"
                                connectionMode={ConnectionMode.Loose}
                            >
                                <Controls position="bottom-right" className="!bg-[#1A1A1A] !border-white/10 !shadow-2xl !rounded-lg overflow-hidden !m-6 !text-white/50" />
                                <MiniMap position="bottom-left" className="!bg-[#121212] !border-white/10 !shadow-2xl !rounded-xl !m-6 overflow-hidden [&_.react-flow__minimap-mask]:!fill-black/80" />
                                <Background variant={'dots' as any} gap={24} size={1} color="#222" />

                                {/* Context Menu */}
                                {menu && (
                                    <div
                                        ref={menuRef}
                                        style={{ top: menu.top, left: menu.left }}
                                        className="fixed bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl py-1 z-[100] min-w-[160px]"
                                        onClick={() => setMenu(null)}
                                    >
                                        {menu.type === 'node' ? (
                                            <>
                                                <button
                                                    onClick={() => duplicateNode(menu.id)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-white/5 transition-colors text-white/70 hover:text-white"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                    Duplicate
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedNodeId(menu.id);
                                                        setActiveTab('properties');
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-white/5 transition-colors text-white/70 hover:text-white"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    Edit Properties
                                                </button>
                                                <div className="h-px bg-white/5 my-1" />
                                                <button
                                                    onClick={() => deleteNode(menu.id)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {nodeTypesList.map((node) => (
                                                    <button
                                                        key={node.type}
                                                        onClick={() => {
                                                            const pos = screenToFlowPosition({ x: menu.left, y: menu.top });
                                                            addNode(node.type, node.label, pos);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-white/5 transition-colors text-white/70 hover:text-white"
                                                    >
                                                        <node.icon className="w-3.5 h-3.5" />
                                                        Add {node.label}
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* MONOCHROME TOOLSET BELOW */}
                                <Panel position="bottom-center" className="mb-8 flex items-center bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl p-1.5 gap-1.5 z-50">
                                    <button className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                                        <MousePointer2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                        <Square className="w-4 h-4" />
                                    </button>
                                    <button className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                        <Type className="w-4 h-4" />
                                    </button>
                                    <div className="h-5 w-px bg-white/10 mx-1" />
                                    <button
                                        onClick={() => setIsSimulating(!isSimulating)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-xs ${isSimulating ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-white text-black hover:bg-white/90'}`}
                                    >
                                        <Play className={`w-4 h-4 ${isSimulating ? 'fill-white' : 'fill-current'}`} />
                                        <span>{isSimulating ? 'Stop Simulation' : 'Simulate'}</span>
                                    </button>
                                </Panel>
                            </ReactFlow>
                        </main>
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-white/5" />

                    {/* RIGHT SIDEBAR: Layers & Properties */}
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="hidden lg:block">
                        <aside className="h-full border-l border-white/5 bg-[#121212] flex flex-col z-40">
                            <div className="flex border-b border-white/5 bg-[#121212]">
                                <button
                                    onClick={() => setActiveTab('layers')}
                                    className={`flex-1 h-10 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'layers' ? 'text-white border-b-2 border-white' : 'text-white/20'}`}
                                >
                                    Layers
                                </button>
                                <button
                                    onClick={() => setActiveTab('properties')}
                                    className={`flex-1 h-10 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'properties' ? 'text-white border-b-2 border-white' : 'text-white/20'}`}
                                >
                                    Properties
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2">
                                {activeTab === 'layers' ? (
                                    <div className="space-y-0.5">
                                        {nodes.map(node => (
                                            <div
                                                key={node.id}
                                                onClick={() => {
                                                    setSelectedNodeId(node.id);
                                                    setActiveTab('properties');
                                                }}
                                                className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all border border-transparent ${selectedNodeId === node.id ? 'bg-white/5 text-white border-white/5' : 'text-white/50 hover:text-white hover:bg-white/5 hover:border-white/5'}`}
                                            >
                                                <LayersIcon className={`w-3.5 h-3.5 transition-opacity ${selectedNodeId === node.id ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`} />
                                                <span className="text-[12px] truncate font-medium">{node.data?.label || node.id}</span>
                                            </div>
                                        ))}
                                        {nodes.length === 0 ? (
                                            <p className="text-center text-white/10 mt-10 text-[11px] uppercase tracking-widest">No active layers</p>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-6">
                                        {selectedNode ? (
                                            <>
                                                <section className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Node Identity</Label>
                                                        <Input
                                                            value={selectedNode.data?.label as string || ''}
                                                            onChange={(e) => updateNodeData(selectedNode.id, e.target.value)}
                                                            className="h-9 bg-black/40 border-white/10 text-white rounded-lg focus:ring-0 focus:border-white/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Node Address</Label>
                                                        <div className="text-[11px] font-mono text-white/40 p-2 bg-black/20 rounded border border-white/5 truncate">
                                                            {selectedNode.id}
                                                        </div>
                                                    </div>
                                                </section>

                                                <div className="h-px bg-white/5" />

                                                <section className="space-y-4">
                                                    <Label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Appearance</Label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {['#444', '#3B82F6', '#EF4444', '#10B981'].map(color => (
                                                            <button
                                                                key={color}
                                                                onClick={() => updateNodeStyle(selectedNode.id, `1px solid ${color}`)}
                                                                className="w-full aspect-square rounded-md border border-white/10 relative transition-transform hover:scale-110 active:scale-95"
                                                                style={{ backgroundColor: color }}
                                                            >
                                                                {(selectedNode.style?.border as string)?.includes(color) && (
                                                                    <div className="absolute inset-0 border-2 border-white rounded-md scale-110" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </section>
                                            </>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-4 py-20">
                                                <Box className="w-8 h-8 text-white/5 mb-4" />
                                                <p className="text-[11px] uppercase tracking-widest text-white/20 font-bold leading-relaxed">
                                                    Select a node on the canvas to edit its properties
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-white/5 flex items-center justify-between text-white/20 bg-[#0A0A0A]">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Ready</span>
                                </div>
                                <Settings className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" />
                            </div>
                        </aside>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}

export default function Workspace() {
    return (
        <ReactFlowProvider>
            <WorkspaceView />
        </ReactFlowProvider>
    );
}
