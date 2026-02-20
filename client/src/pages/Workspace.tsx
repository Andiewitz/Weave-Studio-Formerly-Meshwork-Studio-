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
    Edit2,
    Search,
    User as UserIcon,
    Maximize,
    ChevronDown,
    ChevronRight,
    Minus,
    Circle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SystemNode } from '@/components/canvas/nodes/SystemNode';

const nodeTypes = {
    server: SystemNode,
    database: SystemNode,
    loadBalancer: SystemNode,
    gateway: SystemNode,
    queue: SystemNode,
    storage: SystemNode,
    logic: SystemNode,
    cdn: SystemNode,
    microservice: SystemNode,
    worker: SystemNode,
    cache: SystemNode,
    search: SystemNode,
    bus: SystemNode,
    region: SystemNode,
    vpc: SystemNode,
    user: SystemNode,
    app: SystemNode,
    api: SystemNode,
    note: SystemNode,
    junction: SystemNode,
};

const nodeTypesList = [
    { type: 'server', label: 'Bare Metal Server', icon: Server, category: 'Compute' },
    { type: 'microservice', label: 'Microservice', icon: Box, category: 'Compute' },
    { type: 'worker', label: 'Background Worker', icon: Cpu, category: 'Compute' },
    { type: 'logic', label: 'Lambda/Logic', icon: Zap, category: 'Compute' },

    { type: 'database', label: 'Database (SQL/NoSQL)', icon: Database, category: 'Data' },
    { type: 'cache', label: 'Redis Cache', icon: Zap, category: 'Data' },
    { type: 'storage', label: 'Object Storage (S3)', icon: HardDrive, category: 'Data' },
    { type: 'search', label: 'Search Index', icon: Search, category: 'Data' },

    { type: 'gateway', label: 'API Gateway', icon: Globe, category: 'Networking' },
    { type: 'loadBalancer', label: 'Load Balancer', icon: Cpu, category: 'Networking' },
    { type: 'cdn', label: 'CDN / Edge', icon: Globe, category: 'Networking' },
    { type: 'bus', label: 'Event Bus (Kafka)', icon: Share2, category: 'Networking' },
    { type: 'queue', label: 'Message Queue', icon: MessageSquare, category: 'Networking' },

    { type: 'vpc', label: 'VPC / Subnet', icon: Square, category: 'Infrastructure' },
    { type: 'region', label: 'Region / Zone', icon: Globe, category: 'Infrastructure' },

    { type: 'user', label: 'End User', icon: UserIcon, category: 'External' },
    { type: 'app', label: 'Mobile/Web App', icon: Box, category: 'External' },
    { type: 'api', label: 'Third Party API', icon: Globe, category: 'External' },

    { type: 'note', label: 'Sticky Note', icon: Type, category: 'Documentation' },

    { type: 'junction', label: 'Junction Point', icon: Circle, category: 'Utilities' },
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
    const [searchTerm, setSearchTerm] = useState('');
    const [snapToGrid, setSnapToGrid] = useState(true);
    const { fitView } = useReactFlow();
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        'Compute': true,
        'Infrastructure': true,
        'Utilities': true
    });

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const history = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
    const redoStack = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);

    const takeSnapshot = useCallback(() => {
        history.current.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
        if (history.current.length > 50) history.current.shift();
        redoStack.current = [];
    }, [nodes, edges]);

    const undo = useCallback(() => {
        if (history.current.length === 0) return;
        const prevState = history.current.pop();
        if (prevState) {
            redoStack.current.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
            setNodes(prevState.nodes);
            setEdges(prevState.edges);
        }
    }, [nodes, edges, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (redoStack.current.length === 0) return;
        const nextState = redoStack.current.pop();
        if (nextState) {
            history.current.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
        }
    }, [nodes, edges, setNodes, setEdges]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    undo();
                } else if (e.key === 'y' || (e.key === 'Z' && e.shiftKey)) {
                    e.preventDefault();
                    redo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const [menu, setMenu] = useState<{ id: string; top: number; left: number; type: 'node' | 'pane' } | null>(null);
    const [layerMenu, setLayerMenu] = useState<{ id: string; top: number; left: number } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const focusNode = useCallback((nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            fitView({
                nodes: [node],
                duration: 800,
                padding: 1.2
            });
            setSelectedNodeId(nodeId);
        }
    }, [nodes, fitView]);

    const onLayerContextMenu = useCallback((event: React.MouseEvent, nodeId: string) => {
        event.preventDefault();
        setLayerMenu({
            id: nodeId,
            top: event.clientY,
            left: event.clientX,
        });
    }, []);

    useEffect(() => {
        if (canvasData) {
            setNodes(canvasData.nodes || []);
            setEdges(canvasData.edges || []);
        }
    }, [canvasData, setNodes, setEdges]);

    useEffect(() => {
        setEdges((eds) =>
            eds.map((edge) => ({
                ...edge,
                animated: isSimulating,
                style: isSimulating ? { stroke: '#FFFFFF', strokeWidth: 2 } : { stroke: '#444' },
            }))
        );
    }, [isSimulating, setEdges]);

    useEffect(() => {
        const handleClickOutside = () => {
            setMenu(null);
            setLayerMenu(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const onConnect = useCallback(
        (params: Connection) => {
            takeSnapshot();
            setEdges((eds) => addEdge({
                ...params,
                type: 'step',
                style: { stroke: '#444', strokeWidth: 2 },
                animated: isSimulating
            }, eds));
        },
        [setEdges, isSimulating, takeSnapshot],
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
        takeSnapshot();
        const nodeTypeInfo = nodeTypesList.find(n => n.type === type);
        const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type,
            position,
            data: {
                label: label,
                category: nodeTypeInfo?.category || 'Compute'
            },
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

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const dataJSON = event.dataTransfer.getData('application/reactflow');
            if (!dataJSON) return;
            const data = JSON.parse(dataJSON);
            if (!data.type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            addNode(data.type, data.label, position);
        },
        [screenToFlowPosition, addNode]
    );

    const deleteNode = useCallback(
        (id: string) => {
            takeSnapshot();
            setNodes((nds) => nds.filter((node) => node.id !== id));
            setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
            if (selectedNodeId === id) setSelectedNodeId(null);
        },
        [setNodes, setEdges, selectedNodeId, takeSnapshot]
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
                if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                    deleteNode(selectedNodeId);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeId, deleteNode]);

    const duplicateNode = useCallback(
        (id: string) => {
            takeSnapshot();
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
        [nodes, setNodes, takeSnapshot]
    );

    const onNodeClick = useCallback((_: any, node: Node) => {
        setSelectedNodeId(node.id);
        setActiveTab('properties');
    }, []);

    const onNodeDoubleClick = useCallback((_: any, node: Node) => {
        if (node.id) {
            setSelectedNodeId(node.id);
            setActiveTab('properties');
            setTimeout(() => {
                const input = document.querySelector('[data-property-input="true"]') as HTMLTextAreaElement | HTMLInputElement;
                input?.focus();
                if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
                    input.select();
                }
            }, 50);
        }
    }, []);

    const updateNodeData = (id: string, newData: any) => {
        takeSnapshot();
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
    };

    const updateNodeStyle = (id: string, border: string) => {
        takeSnapshot();
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, style: { ...node.style, border } };
                }
                return node;
            })
        );
    };

    const onNodeDragStart = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#000000]">
                <Loader2 className="w-8 h-8 animate-spin text-white/10" />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col font-sans text-sm selection:bg-black/10 bg-[#FDFCF8] text-black">
            <header className="h-12 border-b flex items-center justify-between px-3 shrink-0 z-50 border-white/5 bg-[#121212] text-white">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-1.5 rounded-md transition-colors text-white/50 hover:text-white hover:bg-white/5">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-4 w-px mx-1 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-white/70" />
                        <span className="font-medium text-white/90">Weaving Studio</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleSave} disabled={isSyncing} className="flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all font-medium text-xs border-white/10 hover:bg-white/5 text-white/80">
                        {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save Architecture
                    </button>
                    <div className="h-4 w-px mx-1 bg-white/10" />
                    <Avatar className="w-7 h-7 ring-1 ring-white/10">
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-white/5 text-white/50 text-[10px] font-bold">{user?.firstName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="hidden md:block">
                        <aside className="h-full border-r flex flex-col z-40 border-black/5 bg-[#121212] text-white">
                            <div className="h-10 border-b flex items-center px-4 gap-2 border-white/5 bg-white/5">
                                <span className="font-bold text-[10px] uppercase tracking-widest text-white/30">Library</span>
                            </div>

                            <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                    <input
                                        type="text"
                                        placeholder="Search components..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-[12px] placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-px">
                                {['Infrastructure', 'Compute', 'Networking', 'Data', 'External', 'Documentation', 'Utilities'].map(category => {
                                    const categoryItems = nodeTypesList.filter(item =>
                                        item.category === category &&
                                        (searchTerm === '' ||
                                            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            item.type.toLowerCase().includes(searchTerm.toLowerCase()))
                                    ).sort((a, b) => a.label.localeCompare(b.label));

                                    if (categoryItems.length === 0) return null;

                                    const isExpanded = expandedCategories[category];

                                    return (
                                        <section key={category} className="border-b border-white/[0.03]">
                                            <button
                                                onClick={() => toggleCategory(category)}
                                                className="w-full h-10 flex items-center px-4 gap-2 transition-colors hover:bg-white/5 group"
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40" />
                                                ) : (
                                                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40" />
                                                )}
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/60">{category}</span>
                                                <span className="ml-auto text-[9px] font-bold text-white/10 group-hover:text-white/20">{categoryItems.length}</span>
                                            </button>

                                            {isExpanded && (
                                                <div className="p-2 grid grid-cols-1 gap-1 bg-white/[0.01]">
                                                    {categoryItems.map((item) => (
                                                        <button
                                                            key={item.type}
                                                            onClick={() => addNode(item.type, item.label)}
                                                            onDragStart={(e) => onDragStart(e, item.type, item.label)}
                                                            draggable
                                                            className="flex items-center gap-3 p-2.5 rounded-lg border border-transparent transition-all text-left group hover:border-white/5 hover:bg-white/5 cursor-grab active:cursor-grabbing"
                                                        >
                                                            <div className="p-1.5 rounded-md transition-colors bg-white/5 text-white/60 group-hover:text-white group-hover:bg-white/10">
                                                                <item.icon className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-[12px] font-medium text-white/70 group-hover:text-white">{item.label}</span>
                                                            <Plus className="w-3 h-3 ml-auto text-white/0 group-hover:text-white/20" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                    );
                                })}
                            </div>
                        </aside>
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-black/5" />

                    <ResizablePanel defaultSize={60}>
                        <main className="h-full relative transition-colors duration-300 bg-[#FDFCF8]">
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onNodeClick={onNodeClick}
                                onNodeDoubleClick={onNodeDoubleClick}
                                onNodeDragStart={onNodeDragStart}
                                onNodeContextMenu={onNodeContextMenu}
                                onPaneContextMenu={onPaneContextMenu as any}
                                onDragOver={onDragOver}
                                onDrop={onDrop}
                                nodeTypes={nodeTypes}
                                fitView
                                defaultEdgeOptions={{
                                    type: 'step',
                                    style: { stroke: '#444', strokeWidth: 2 },
                                }}
                                snapToGrid={snapToGrid}
                                snapGrid={[12, 12]}
                                colorMode="light"
                                connectionMode={ConnectionMode.Loose}
                            >
                                <Controls position="bottom-right" className="!bg-white !border-black/10 !text-black/50 !shadow-2xl !rounded-lg overflow-hidden !m-6" />
                                <MiniMap position="bottom-left" className="!bg-white !border-black/5 !shadow-2xl !rounded-xl !m-6 overflow-hidden [&_.react-flow__minimap-mask]:!fill-black/80" />
                                <Background variant={'lines' as any} gap={24} size={1} color="#DDD" />

                                {menu && (
                                    <div
                                        ref={menuRef}
                                        style={{ top: menu.top, left: menu.left }}
                                        className="fixed border rounded-lg shadow-2xl py-1 z-[100] min-w-[160px] bg-white border-black/10"
                                        onClick={() => setMenu(null)}
                                    >
                                        {menu.type === 'node' ? (
                                            <>
                                                <button
                                                    onClick={() => duplicateNode(menu.id)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                    Duplicate
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedNodeId(menu.id);
                                                        setActiveTab('properties');
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    Edit Properties
                                                </button>
                                                <div className="h-px my-1 bg-black/5" />
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
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
                                                    >
                                                        <node.icon className="w-3.5 h-3.5" />
                                                        Add {node.label}
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}

                                {layerMenu && (
                                    <div
                                        style={{ top: layerMenu.top, left: layerMenu.left }}
                                        className="fixed border rounded-lg shadow-2xl py-1 z-[200] min-w-[180px] bg-[#1a1a1a] border-white/10"
                                        onClick={() => setLayerMenu(null)}
                                    >
                                        <button
                                            onClick={() => focusNode(layerMenu.id)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                        >
                                            <Maximize className="w-3.5 h-3.5" />
                                            Focus on Canvas
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedNodeId(layerMenu.id);
                                                setActiveTab('properties');
                                                setTimeout(() => {
                                                    const input = document.querySelector('[data-property-input="true"]') as HTMLInputElement;
                                                    input?.focus();
                                                }, 50);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Rename Layer
                                        </button>
                                        <button
                                            onClick={() => duplicateNode(layerMenu.id)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            Duplicate
                                        </button>
                                        <div className="h-px my-1 bg-white/5" />
                                        <button
                                            onClick={() => deleteNode(layerMenu.id)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete Layer
                                        </button>
                                    </div>
                                )}

                                <Panel position="bottom-center" className="mb-8 flex items-center border rounded-2xl shadow-2xl p-1.5 gap-1.5 z-50 bg-white border-black/10">
                                    <button className="p-2.5 rounded-xl transition-all bg-black/10 text-black hover:bg-black/20">
                                        <MousePointer2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2.5 rounded-xl transition-all text-black/40 hover:text-black hover:bg-black/5">
                                        <Square className="w-4 h-4" />
                                    </button>
                                    <button className="p-2.5 rounded-xl transition-all text-black/40 hover:text-black hover:bg-black/5">
                                        <Type className="w-4 h-4" />
                                    </button>
                                    <button className="p-2.5 rounded-xl transition-all text-black/40 hover:text-black hover:bg-black/5" title="Edge Tool">
                                        <Minus className="w-4 h-4 rotate-45" />
                                    </button>
                                    <div className="h-5 w-px mx-1 bg-black/10" />
                                    <button
                                        onClick={() => fitView({ duration: 800 })}
                                        className="p-2.5 rounded-xl transition-all text-black/40 hover:text-black hover:bg-black/5"
                                        title="Fit View"
                                    >
                                        <Maximize className="w-4 h-4" />
                                    </button>
                                    <div className="h-5 w-px mx-1 bg-black/10" />
                                    <button
                                        onClick={() => setIsSimulating(!isSimulating)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-xs ${isSimulating ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-black text-white hover:bg-black/90'}`}
                                    >
                                        <Play className={`w-4 h-4 ${isSimulating ? 'fill-white' : 'fill-current'}`} />
                                        <span>{isSimulating ? 'Stop Simulation' : 'Simulate'}</span>
                                    </button>
                                </Panel>
                            </ReactFlow>
                        </main>
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-white/5" />

                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="hidden lg:block">
                        <aside className="h-full border-l flex flex-col z-40 border-black/10 bg-[#121212] text-white">
                            <div className="flex border-b border-white/5 bg-white/5">
                                <button
                                    onClick={() => setActiveTab('layers')}
                                    className={`flex-1 h-10 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'layers' ? 'text-white border-b-2 border-white' : 'text-white/20 hover:text-white/40'}`}
                                >
                                    Layers
                                </button>
                                <button
                                    onClick={() => setActiveTab('properties')}
                                    className={`flex-1 h-10 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'properties' ? 'text-white border-b-2 border-white' : 'text-white/20 hover:text-white/40'}`}
                                >
                                    Properties
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2">
                                {activeTab === 'layers' ? (
                                    <div className="space-y-0.5">
                                        {nodes.length > 0 ? nodes.map(node => (
                                            <div
                                                key={node.id}
                                                onClick={() => {
                                                    setSelectedNodeId(node.id);
                                                    setActiveTab('properties');
                                                }}
                                                onContextMenu={(e) => onLayerContextMenu(e as any, node.id)}
                                                className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all border border-transparent ${selectedNodeId === node.id ? 'bg-white/10 text-white border-white/5' : 'text-white/50 hover:text-white hover:bg-white/5 hover:border-white/5'}`}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                                <span className="flex-1 truncate text-[11px] font-medium tracking-tight">{(node.data?.label as string) || node.type}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/10 group-hover:text-white/20">{node.data?.category as string}</span>
                                            </div>
                                        )) : (
                                            <div className="py-20 text-center">
                                                <p className="text-[10px] uppercase tracking-widest text-white/10 font-bold">No Layers Yet</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-6">
                                        {selectedNode ? (
                                            <>
                                                <section className="space-y-4">
                                                    {selectedNode.type === 'note' ? (
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Note Contents</Label>
                                                            <Textarea
                                                                data-property-input="true"
                                                                value={(selectedNode.data?.label as string) || ''}
                                                                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                                                                className="min-h-[200px] rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 text-[12px] resize-none"
                                                                placeholder="Type your note here..."
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Display Name</Label>
                                                                <Input
                                                                    data-property-input="true"
                                                                    value={(selectedNode.data?.label as string) || ''}
                                                                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                                                                    className="h-8 rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 text-[12px]"
                                                                />
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Description</Label>
                                                                <Textarea
                                                                    value={(selectedNode.data?.description as string) || ''}
                                                                    onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                                                                    className="min-h-[60px] rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 text-[11px] resize-none"
                                                                    placeholder="Add architectural details..."
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </section>

                                                <div className="h-px bg-white/5" />

                                                <section className="space-y-4">
                                                    <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Dimensions</Label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Width (PX)</div>
                                                            <Input
                                                                type="number"
                                                                value={selectedNode.data?.width || ''}
                                                                onChange={(e) => updateNodeData(selectedNode.id, { width: parseInt(e.target.value) })}
                                                                className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Height (PX)</div>
                                                            <Input
                                                                type="number"
                                                                value={selectedNode.data?.height || ''}
                                                                onChange={(e) => updateNodeData(selectedNode.id, { height: parseInt(e.target.value) })}
                                                                className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                            />
                                                        </div>
                                                    </div>
                                                </section>

                                                <div className="h-px bg-white/5" />

                                                <section className="space-y-4">
                                                    <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Technical Configuration</Label>

                                                    <div className="space-y-3">
                                                        {selectedNode.type === 'database' && (
                                                            <div className="space-y-1.5">
                                                                <div className="text-[9px] text-white/20 uppercase font-bold">Provider</div>
                                                                <select
                                                                    value={(selectedNode.data?.provider as string) || 'postgresql'}
                                                                    onChange={(e) => updateNodeData(selectedNode.id, { provider: e.target.value })}
                                                                    className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                                                >
                                                                    <option value="postgresql" className="bg-[#1a1a1a]">PostgreSQL</option>
                                                                    <option value="mongodb" className="bg-[#1a1a1a]">MongoDB</option>
                                                                    <option value="mysql" className="bg-[#1a1a1a]">MySQL</option>
                                                                    <option value="redis" className="bg-[#1a1a1a]">Redis</option>
                                                                    <option value="oracle" className="bg-[#1a1a1a]">Oracle</option>
                                                                    <option value="dynamodb" className="bg-[#1a1a1a]">DynamoDB</option>
                                                                </select>
                                                            </div>
                                                        )}

                                                        {['gateway', 'loadBalancer', 'api', 'cdn'].includes(selectedNode.type!) && (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[9px] text-white/20 uppercase font-bold">Protocol</div>
                                                                    <Input
                                                                        value={(selectedNode.data?.protocol as string) || 'HTTPS'}
                                                                        onChange={(e) => updateNodeData(selectedNode.id, { protocol: e.target.value })}
                                                                        className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[9px] text-white/20 uppercase font-bold">Port</div>
                                                                    <Input
                                                                        value={(selectedNode.data?.port as string) || '443'}
                                                                        onChange={(e) => updateNodeData(selectedNode.id, { port: e.target.value })}
                                                                        className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {['server', 'microservice', 'worker'].includes(selectedNode.type!) && (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[9px] text-white/20 uppercase font-bold">CPU</div>
                                                                    <Input
                                                                        value={(selectedNode.data?.cpu as string) || '2 vCPU'}
                                                                        onChange={(e) => updateNodeData(selectedNode.id, { cpu: e.target.value })}
                                                                        className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[9px] text-white/20 uppercase font-bold">RAM</div>
                                                                    <Input
                                                                        value={(selectedNode.data?.ram as string) || '4GB'}
                                                                        onChange={(e) => updateNodeData(selectedNode.id, { ram: e.target.value })}
                                                                        className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-1.5">
                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Environment</div>
                                                            <select
                                                                value={(selectedNode.data?.env as string) || 'production'}
                                                                onChange={(e) => updateNodeData(selectedNode.id, { env: e.target.value })}
                                                                className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                                            >
                                                                <option value="production" className="bg-[#1a1a1a]">Production</option>
                                                                <option value="staging" className="bg-[#1a1a1a]">Staging</option>
                                                                <option value="development" className="bg-[#1a1a1a]">Development</option>
                                                            </select>
                                                        </div>

                                                        {['user', 'app', 'api'].includes(selectedNode.type!) && (
                                                            <div className="space-y-1.5">
                                                                <div className="text-[9px] text-white/20 uppercase font-bold">Endpoint / URL</div>
                                                                <Input
                                                                    value={(selectedNode.data?.url as string) || ''}
                                                                    onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                                                                    placeholder="https://api.example.com"
                                                                    className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Storage Specific */}
                                                        {selectedNode.type === 'storage' && (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[9px] text-white/20 uppercase font-bold">Capacity</div>
                                                                    <Input
                                                                        value={(selectedNode.data?.capacity as string) || '500GB'}
                                                                        onChange={(e) => updateNodeData(selectedNode.id, { capacity: e.target.value })}
                                                                        className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[9px] text-white/20 uppercase font-bold">Type</div>
                                                                    <select
                                                                        value={(selectedNode.data?.storageType as string) || 'object'}
                                                                        onChange={(e) => updateNodeData(selectedNode.id, { storageType: e.target.value })}
                                                                        className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                                                    >
                                                                        <option value="object" className="bg-[#1a1a1a]">Object (S3)</option>
                                                                        <option value="block" className="bg-[#1a1a1a]">Block (EBS)</option>
                                                                        <option value="file" className="bg-[#1a1a1a]">File (EFS)</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Queue Specific */}
                                                        {selectedNode.type === 'queue' && (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[9px] text-white/20 uppercase font-bold">Queue Type</div>
                                                                    <select
                                                                        value={(selectedNode.data?.queueType as string) || 'standard'}
                                                                        onChange={(e) => updateNodeData(selectedNode.id, { queueType: e.target.value })}
                                                                        className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                                                    >
                                                                        <option value="standard" className="bg-[#1a1a1a]">Standard</option>
                                                                        <option value="fifo" className="bg-[#1a1a1a]">FIFO</option>
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[9px] text-white/20 uppercase font-bold">Retention</div>
                                                                    <Input
                                                                        value={(selectedNode.data?.retention as string) || '4 days'}
                                                                        onChange={(e) => updateNodeData(selectedNode.id, { retention: e.target.value })}
                                                                        className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Cache Specific */}
                                                        {selectedNode.type === 'cache' && (
                                                            <div className="space-y-1.5">
                                                                <div className="text-[9px] text-white/20 uppercase font-bold">Eviction Policy</div>
                                                                <select
                                                                    value={(selectedNode.data?.eviction as string) || 'lru'}
                                                                    onChange={(e) => updateNodeData(selectedNode.id, { eviction: e.target.value })}
                                                                    className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                                                >
                                                                    <option value="lru" className="bg-[#1a1a1a]">LRU (Least Recently Used)</option>
                                                                    <option value="lfu" className="bg-[#1a1a1a]">LFU (Least Frequently Used)</option>
                                                                    <option value="ttl" className="bg-[#1a1a1a]">TTL (Time To Live)</option>
                                                                </select>
                                                            </div>
                                                        )}

                                                        {/* Data Bus Specific */}
                                                        {selectedNode.type === 'bus' && (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[9px] text-white/20 uppercase font-bold">Partitions</div>
                                                                    <Input
                                                                        type="number"
                                                                        value={(selectedNode.data?.partitions as number) || 3}
                                                                        onChange={(e) => updateNodeData(selectedNode.id, { partitions: parseInt(e.target.value) })}
                                                                        className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[9px] text-white/20 uppercase font-bold">Replication</div>
                                                                    <Input
                                                                        type="number"
                                                                        value={(selectedNode.data?.replication as number) || 2}
                                                                        onChange={(e) => updateNodeData(selectedNode.id, { replication: parseInt(e.target.value) })}
                                                                        className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {selectedNode.type === 'database' && (
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[9px] uppercase tracking-widest font-bold text-white/20">Collections / Tables</Label>
                                                                <Textarea
                                                                    placeholder="users&#10;orders&#10;products"
                                                                    value={(selectedNode.data?.collections as string[] || []).join('\n')}
                                                                    onChange={(e) => {
                                                                        const colls = e.target.value.split('\n').filter(s => s.trim() !== '');
                                                                        updateNodeData(selectedNode.id, { collections: colls });
                                                                    }}
                                                                    className="min-h-[80px] rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 resize-none text-[11px] font-mono"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </section>

                                                <div className="h-px bg-white/5" />

                                                <section className="space-y-4 pb-12">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Node Appearance</Label>
                                                        <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${selectedNode?.data?.category === 'Data' ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                                                            {(selectedNode?.data?.category as string) || 'Node'}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {['#4F46E5', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4', '#222222', '#FFFFFF'].map(color => (
                                                            <button
                                                                key={color}
                                                                onClick={() => selectedNode && updateNodeStyle(selectedNode.id, `2px solid ${color}`)}
                                                                className="w-full aspect-square rounded-lg border relative transition-all hover:scale-110 border-white/5"
                                                                style={{ backgroundColor: color }}
                                                            >
                                                                {(selectedNode?.style?.border as string)?.toLowerCase().includes(color.toLowerCase()) && (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference shadow-sm" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </section>
                                            </>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-4 py-20">
                                                <Box className="w-8 h-8 mb-4 text-white/5" />
                                                <p className="text-[11px] uppercase tracking-widest font-bold leading-relaxed text-white/20">
                                                    Select a node on the canvas to edit its properties
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t flex items-center justify-between border-white/5 text-white/20 bg-[#0A0A0A]">
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
