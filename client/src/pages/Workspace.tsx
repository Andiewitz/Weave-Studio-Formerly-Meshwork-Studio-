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
    Pencil,
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
    Grid,
    Monitor,
    Cloud,
    GitBranch,
    Shield,
    Lock,
    Key,
    Activity,
    BarChart3,
    PieChart,
    CreditCard,
    MessageCircle,
    ShoppingCart,
    PlayCircle,
    Terminal,
    Layers,
    Layout,
    Briefcase,
    Search,
    User as UserIcon,
    Maximize,
    ChevronDown,
    ChevronRight,
    Minus,
    Circle,
    AlignVerticalJustifyCenter,
    AlignHorizontalJustifyCenter,
    RotateCw,
    Spline,
    ArrowUpRight,
    Milestone,
    ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SystemNode } from '@/components/canvas/nodes/SystemNode';
import {
    K8sPodIcon, K8sDeployIcon, K8sReplicaSetIcon, K8sStatefulIcon, K8sDaemonIcon,
    K8sServiceIcon, K8sIngressIcon, K8sConfigMapIcon, K8sSecretIcon, K8sPVCIcon,
    K8sJobIcon, K8sCronJobIcon, K8sHPAIcon, K8sNamespaceIcon
} from '@/components/canvas/icons/KubernetesIcons';

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
    annotation: SystemNode,
    junction: SystemNode,
    // Kubernetes
    'k8s-pod': SystemNode,
    'k8s-deployment': SystemNode,
    'k8s-replicaset': SystemNode,
    'k8s-statefulset': SystemNode,
    'k8s-daemonset': SystemNode,
    'k8s-service': SystemNode,
    'k8s-ingress': SystemNode,
    'k8s-configmap': SystemNode,
    'k8s-secret': SystemNode,
    'k8s-pvc': SystemNode,
    'k8s-job': SystemNode,
    'k8s-cronjob': SystemNode,
    'k8s-hpa': SystemNode,
    'k8s-namespace': SystemNode,
    // Networking
    route53: SystemNode,
    nats: SystemNode,
    socketio: SystemNode,
    pusher: SystemNode,
    // CI/CD
    github_actions: SystemNode,
    jenkins: SystemNode,
    circleci: SystemNode,
    gitlab: SystemNode,
    argocd: SystemNode,
    // Security
    vault: SystemNode,
    auth0: SystemNode,
    okta: SystemNode,
    waf: SystemNode,
    // Monitoring
    prometheus: SystemNode,
    grafana: SystemNode,
    datadog: SystemNode,
    // Analytics
    influxdb: SystemNode,
    snowflake: SystemNode,
    clickhouse: SystemNode,
    // External
    stripe: SystemNode,
    twilio: SystemNode,
    sendgrid: SystemNode,
    shopify: SystemNode,
    paypal: SystemNode,
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
    { type: 'influxdb', label: 'InfluxDB', icon: BarChart3, category: 'Data' },
    { type: 'snowflake', label: 'Snowflake', icon: Layers, category: 'Data' },
    { type: 'clickhouse', label: 'Clickhouse', icon: Database, category: 'Data' },

    { type: 'gateway', label: 'API Gateway', icon: Globe, category: 'Networking' },
    { type: 'loadBalancer', label: 'Load Balancer', icon: Cpu, category: 'Networking' },
    { type: 'cdn', label: 'CDN / Edge', icon: Globe, category: 'Networking' },
    { type: 'bus', label: 'Event Bus (Kafka)', icon: Share2, category: 'Networking' },
    { type: 'queue', label: 'Message Queue', icon: MessageSquare, category: 'Networking' },
    { type: 'route53', label: 'Route 53', icon: Globe, category: 'Networking' },
    { type: 'nats', label: 'NATS', icon: Activity, category: 'Networking' },
    { type: 'socketio', label: 'Socket.io', icon: MessageCircle, category: 'Networking' },
    { type: 'pusher', label: 'Pusher', icon: Zap, category: 'Networking' },

    { type: 'github_actions', label: 'GitHub Actions', icon: PlayCircle, category: 'CI/CD' },
    { type: 'jenkins', label: 'Jenkins', icon: Settings, category: 'CI/CD' },
    { type: 'circleci', label: 'CircleCI', icon: RotateCw, category: 'CI/CD' },
    { type: 'gitlab', label: 'GitLab', icon: GitBranch, category: 'CI/CD' },
    { type: 'argocd', label: 'Argo CD', icon: PlayCircle, category: 'CI/CD' },

    { type: 'vault', label: 'HashiCorp Vault', icon: Lock, category: 'Security' },
    { type: 'auth0', label: 'Auth0', icon: Key, category: 'Security' },
    { type: 'okta', label: 'Okta', icon: Shield, category: 'Security' },
    { type: 'waf', label: 'Cloudflare WAF', icon: Shield, category: 'Security' },

    { type: 'prometheus', label: 'Prometheus', icon: Activity, category: 'Monitoring' },
    { type: 'grafana', label: 'Grafana', icon: BarChart3, category: 'Monitoring' },
    { type: 'datadog', label: 'Datadog', icon: PieChart, category: 'Monitoring' },

    { type: 'vpc', label: 'VPC / Subnet', icon: Square, category: 'Infrastructure' },
    { type: 'region', label: 'Region / Zone', icon: Globe, category: 'Infrastructure' },

    { type: 'user', label: 'End User', icon: UserIcon, category: 'External' },
    { type: 'app', label: 'Mobile/Web App', icon: Box, category: 'External' },
    { type: 'api', label: 'Third Party API', icon: Globe, category: 'External' },
    { type: 'stripe', label: 'Stripe', icon: CreditCard, category: 'External' },
    { type: 'twilio', label: 'Twilio', icon: MessageCircle, category: 'External' },
    { type: 'sendgrid', label: 'SendGrid', icon: MessageCircle, category: 'External' },
    { type: 'shopify', label: 'Shopify', icon: ShoppingCart, category: 'External' },
    { type: 'paypal', label: 'PayPal', icon: CreditCard, category: 'External' },

    { type: 'note', label: 'Sticky Note', icon: Type, category: 'Documentation' },

    { type: 'junction', label: 'Junction Point', icon: Circle, category: 'Utilities' },

    // Kubernetes — Workloads
    { type: 'k8s-pod', label: 'Pod', icon: K8sPodIcon, category: 'Kubernetes' },
    { type: 'k8s-deployment', label: 'Deployment', icon: K8sDeployIcon, category: 'Kubernetes' },
    { type: 'k8s-replicaset', label: 'ReplicaSet', icon: K8sReplicaSetIcon, category: 'Kubernetes' },
    { type: 'k8s-statefulset', label: 'StatefulSet', icon: K8sStatefulIcon, category: 'Kubernetes' },
    { type: 'k8s-daemonset', label: 'DaemonSet', icon: K8sDaemonIcon, category: 'Kubernetes' },
    { type: 'k8s-job', label: 'Job', icon: K8sJobIcon, category: 'Kubernetes' },
    { type: 'k8s-cronjob', label: 'CronJob', icon: K8sCronJobIcon, category: 'Kubernetes' },
    // Kubernetes — Networking
    { type: 'k8s-service', label: 'Service', icon: K8sServiceIcon, category: 'Kubernetes' },
    { type: 'k8s-ingress', label: 'Ingress', icon: K8sIngressIcon, category: 'Kubernetes' },
    // Kubernetes — Config & Storage
    { type: 'k8s-configmap', label: 'ConfigMap', icon: K8sConfigMapIcon, category: 'Kubernetes' },
    { type: 'k8s-secret', label: 'Secret', icon: K8sSecretIcon, category: 'Kubernetes' },
    { type: 'k8s-pvc', label: 'PersistentVolumeClaim', icon: K8sPVCIcon, category: 'Kubernetes' },
    // Kubernetes — Scaling & Grouping
    { type: 'k8s-hpa', label: 'HPA (Autoscaler)', icon: K8sHPAIcon, category: 'Kubernetes' },
    { type: 'k8s-namespace', label: 'Namespace', icon: K8sNamespaceIcon, category: 'Kubernetes' },

    // Complex Distributed Systems Templates
    { type: 'template:ecommerce', label: 'E-commerce Microservices', icon: ShoppingCart, category: 'Templates' },
    { type: 'template:ai-platform', label: 'AI/ML Data Platform', icon: Activity, category: 'Templates' },
    { type: 'template:enterprise-k8s', label: 'Enterprise K8s Cluster', icon: Layers, category: 'Templates' },
    { type: 'template:fintech-saas', label: 'FinTech SaaS Stack', icon: CreditCard, category: 'Templates' },
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
    const [edgeType, setEdgeType] = useState<'step' | 'straight' | 'smoothstep' | 'default'>('step');
    const [edgeStyle, setEdgeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
    const [hasArrow, setHasArrow] = useState(false);
    const [drawingMode, setDrawingMode] = useState<'select' | 'annotation' | 'infrastructure'>('select');
    const { fitView } = useReactFlow();
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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
            eds.map((edge) => {
                const currentStyle = (edge.style as any) || {};
                const newStyle = {
                    ...currentStyle,
                    stroke: isSimulating ? '#FFFFFF' : '#444'
                };

                let newMarkerEnd = edge.markerEnd as any;
                if (newMarkerEnd && typeof newMarkerEnd === 'object') {
                    newMarkerEnd = {
                        ...newMarkerEnd,
                        color: isSimulating ? '#FFFFFF' : '#444'
                    };
                }

                return {
                    ...edge,
                    animated: isSimulating,
                    style: newStyle,
                    markerEnd: newMarkerEnd
                };
            })
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

    const addNode = useCallback((type: string, label: string, position = { x: 100, y: 100 }) => {
        takeSnapshot();
        const nodeTypeInfo = nodeTypesList.find(n => n.type === type);

        // Match dimensions from SystemNode
        const dimensions: Record<string, { w: number, h: number }> = {
            server: { w: 168, h: 72 },
            microservice: { w: 168, h: 72 },
            worker: { w: 168, h: 72 },
            logic: { w: 168, h: 72 },
            database: { w: 144, h: 120 },
            cache: { w: 144, h: 120 },
            storage: { w: 144, h: 120 },
            search: { w: 144, h: 120 },
            influxdb: { w: 144, h: 120 },
            snowflake: { w: 144, h: 120 },
            clickhouse: { w: 144, h: 120 },
            gateway: { w: 192, h: 72 },
            loadBalancer: { w: 192, h: 72 },
            cdn: { w: 192, h: 72 },
            bus: { w: 192, h: 72 },
            queue: { w: 192, h: 72 },
            route53: { w: 192, h: 72 },
            nats: { w: 192, h: 72 },
            socketio: { w: 144, h: 72 },
            pusher: { w: 144, h: 72 },
            github_actions: { w: 168, h: 72 },
            jenkins: { w: 168, h: 72 },
            circleci: { w: 168, h: 72 },
            gitlab: { w: 168, h: 72 },
            argocd: { w: 168, h: 72 },
            vault: { w: 168, h: 72 },
            auth0: { w: 168, h: 72 },
            okta: { w: 168, h: 72 },
            waf: { w: 168, h: 72 },
            prometheus: { w: 168, h: 72 },
            grafana: { w: 168, h: 72 },
            datadog: { w: 168, h: 72 },
            stripe: { w: 168, h: 72 },
            twilio: { w: 168, h: 72 },
            sendgrid: { w: 168, h: 72 },
            shopify: { w: 168, h: 72 },
            paypal: { w: 168, h: 72 },
            note: { w: 192, h: 192 },
            annotation: { w: 160, h: 48 },
            text: { w: 200, h: 40 },
            vpc: { w: 408, h: 312 },
            region: { w: 600, h: 408 },
            // Kubernetes
            'k8s-pod': { w: 144, h: 96 },
            'k8s-deployment': { w: 192, h: 96 },
            'k8s-replicaset': { w: 168, h: 96 },
            'k8s-statefulset': { w: 168, h: 96 },
            'k8s-daemonset': { w: 168, h: 96 },
            'k8s-service': { w: 168, h: 72 },
            'k8s-ingress': { w: 168, h: 72 },
            'k8s-configmap': { w: 168, h: 72 },
            'k8s-secret': { w: 168, h: 72 },
            'k8s-pvc': { w: 168, h: 96 },
            'k8s-job': { w: 144, h: 72 },
            'k8s-cronjob': { w: 168, h: 96 },
            'k8s-hpa': { w: 168, h: 96 },
            'k8s-namespace': { w: 408, h: 312 },
        };

        const dim = dimensions[type] || { w: 168, h: 96 };

        const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type,
            position,
            style: { width: dim.w, height: dim.h },
            data: {
                label: label,
                category: nodeTypeInfo?.category || 'Compute'
            },
        };
        setNodes((nds) => nds.concat(newNode));
        return newNode;
    }, [takeSnapshot, setNodes]);

    const deleteNode = useCallback((id: string) => {
        takeSnapshot();
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        if (selectedNodeId === id) setSelectedNodeId(null);
    }, [takeSnapshot, setNodes, setEdges, selectedNodeId]);

    const updateNodeData = useCallback((id: string, newData: any) => {
        takeSnapshot();
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
    }, [takeSnapshot, setNodes]);

    const updateNodeStyle = useCallback((id: string, style: any) => {
        takeSnapshot();
        const snappedStyle = typeof style === 'object' ? { ...style } : { border: style };

        if (typeof snappedStyle.width === 'number') snappedStyle.width = Math.round(snappedStyle.width / 24) * 24;
        if (typeof snappedStyle.height === 'number') snappedStyle.height = Math.round(snappedStyle.height / 24) * 24;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, style: { ...node.style, ...snappedStyle } };
                }
                return node;
            })
        );
    }, [takeSnapshot, setNodes]);

    const onConnect = useCallback(
        (params: Connection) => {
            takeSnapshot();
            const style: any = { stroke: '#444', strokeWidth: 2 };
            if (edgeStyle === 'dashed') style.strokeDasharray = '5 5';
            if (edgeStyle === 'dotted') style.strokeDasharray = '2 2';

            setEdges((eds) => addEdge({
                ...params,
                type: edgeType,
                style,
                animated: isSimulating,
                markerEnd: hasArrow ? { type: 'arrowclosed' as any, color: '#444' } : undefined
            }, eds));
        },
        [setEdges, isSimulating, takeSnapshot, edgeType, edgeStyle, hasArrow],
    );

    const onPaneClick = useCallback((event: React.MouseEvent) => {
        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        if (drawingMode === 'annotation') {
            addNode('annotation', 'Click to edit...', position);
        } else if (drawingMode === 'infrastructure') {
            addNode('vpc', 'New VPC', position);
        }
    }, [drawingMode, screenToFlowPosition, addNode]);

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

    const applyTemplate = (templateType: string, position: { x: number, y: number }) => {
        takeSnapshot();
        const base = position;
        let newNodes: Node[] = [];
        let newEdges: Edge[] = [];

        if (templateType === 'template:ecommerce') {
            const r53 = { id: `r53-${Date.now()}`, type: 'route53', position: { x: base.x, y: base.y }, data: { label: 'Global DNS', category: 'Networking' }, style: { width: 192, height: 72 } };
            const waf = { id: `waf-${Date.now()}`, type: 'waf', position: { x: base.x + 240, y: base.y }, data: { label: 'Cloudflare WAF', category: 'Security' }, style: { width: 168, height: 72 } };
            const cdn = { id: `cdn-${Date.now()}`, type: 'cdn', position: { x: base.x + 240, y: base.y + 120 }, data: { label: 'Static Assets', category: 'Networking' }, style: { width: 192, height: 72 } };
            const alb = { id: `alb-${Date.now()}`, type: 'loadBalancer', position: { x: base.x + 480, y: base.y }, data: { label: 'Core ALB', category: 'Networking' }, style: { width: 192, height: 72 } };

            // Microservices
            const auth = { id: `auth-${Date.now()}`, type: 'auth0', position: { x: base.x + 720, y: base.y - 120 }, data: { label: 'Auth Service', category: 'Security' }, style: { width: 168, height: 72 } };
            const product = { id: `prod-${Date.now()}`, type: 'microservice', position: { x: base.x + 720, y: base.y }, data: { label: 'Product API', category: 'Compute' }, style: { width: 168, height: 72 } };
            const order = { id: `order-${Date.now()}`, type: 'microservice', position: { x: base.x + 720, y: base.y + 120 }, data: { label: 'Order Service', category: 'Compute' }, style: { width: 168, height: 72 } };

            // Support
            const redis = { id: `redis-${Date.now()}`, type: 'cache', position: { x: base.x + 960, y: base.y - 60 }, data: { label: 'Catalog Cache', category: 'Data' }, style: { width: 144, height: 120 } };
            const pg = { id: `pg-${Date.now()}`, type: 'database', position: { x: base.x + 960, y: base.y + 60 }, data: { label: 'Master DB', provider: 'postgresql', category: 'Data' }, style: { width: 144, height: 120 } };
            const stripe = { id: `stripe-${Date.now()}`, type: 'stripe', position: { x: base.x + 960, y: base.y + 240 }, data: { label: 'Payments', category: 'External' }, style: { width: 168, height: 72 } };

            // Event Bus
            const kafka = { id: `kafka-${Date.now()}`, type: 'bus', position: { x: base.x + 720, y: base.y + 240 }, data: { label: 'Event Stream', category: 'Networking' }, style: { width: 192, height: 72 } };

            newNodes = [r53, waf, cdn, alb, auth, product, order, redis, pg, stripe, kafka];
            newEdges = [
                { id: `e-${Date.now()}-1`, source: r53.id, target: waf.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-2`, source: waf.id, target: alb.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-3`, source: waf.id, target: cdn.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-4`, source: alb.id, target: auth.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-5`, source: alb.id, target: product.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-6`, source: alb.id, target: order.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-7`, source: product.id, target: redis.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-8`, source: order.id, target: pg.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-9`, source: order.id, target: kafka.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-10`, source: order.id, target: stripe.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            ];
        } else if (templateType === 'template:ai-platform') {
            const app = { id: `app-${Date.now()}`, type: 'app', position: { x: base.x, y: base.y }, data: { label: 'AI Client App', category: 'External' }, style: { width: 168, height: 72 } };
            const nats = { id: `nats-${Date.now()}`, type: 'nats', position: { x: base.x + 240, y: base.y }, data: { label: 'Real-time Ingress', category: 'Networking' }, style: { width: 192, height: 72 } };
            const influx = { id: `inf-${Date.now()}`, type: 'influxdb', position: { x: base.x + 480, y: base.y - 120 }, data: { label: 'Telemetry Store', category: 'Data' }, style: { width: 144, height: 120 } };
            const worker = { id: `worker-${Date.now()}`, type: 'worker', position: { x: base.x + 480, y: base.y }, data: { label: 'Inference Engine', category: 'Compute' }, style: { width: 168, height: 72 } };
            const vault = { id: `vault-${Date.now()}`, type: 'vault', position: { x: base.x + 480, y: base.y + 120 }, data: { label: 'Secrets Mgmt', category: 'Security' }, style: { width: 168, height: 72 } };

            const snowflake = { id: `snow-${Date.now()}`, type: 'snowflake', position: { x: base.x + 720, y: base.y }, data: { label: 'Model Warehouse', category: 'Data' }, style: { width: 144, height: 120 } };
            const clickhouse = { id: `ch-${Date.now()}`, type: 'clickhouse', position: { x: base.x + 720, y: base.y + 180 }, data: { label: 'Vector Search', category: 'Data' }, style: { width: 144, height: 120 } };

            const prom = { id: `prom-${Date.now()}`, type: 'prometheus', position: { x: base.x + 960, y: base.y - 60 }, data: { label: 'Metrics', category: 'Monitoring' }, style: { width: 168, height: 72 } };
            const grafana = { id: `graf-${Date.now()}`, type: 'grafana', position: { x: base.x + 960, y: base.y + 60 }, data: { label: 'AI Dashboard', category: 'Monitoring' }, style: { width: 168, height: 72 } };

            newNodes = [app, nats, influx, worker, vault, snowflake, clickhouse, prom, grafana];
            newEdges = [
                { id: `e-${Date.now()}-1`, source: app.id, target: nats.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-2`, source: nats.id, target: influx.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-3`, source: nats.id, target: worker.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-4`, source: worker.id, target: vault.id, type: 'step', style: { stroke: '#444', strokeWidth: 2, strokeDasharray: '5,5' } },
                { id: `e-${Date.now()}-5`, source: worker.id, target: snowflake.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-6`, source: worker.id, target: clickhouse.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-7`, source: snowflake.id, target: prom.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-8`, source: prom.id, target: grafana.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            ];
        } else if (templateType === 'template:enterprise-k8s') {
            const region = { id: `reg-${Date.now()}`, type: 'region', position: { x: base.x, y: base.y }, data: { label: 'AWS us-east-1', category: 'Infrastructure' }, style: { width: 1200, height: 600 } };
            const vpc = { id: `vpc-${Date.now()}`, type: 'vpc', position: { x: base.x + 50, y: base.y + 50 }, data: { label: 'Prod VPC', category: 'Infrastructure' }, parentId: region.id, style: { width: 1100, height: 500 } };

            const ingress = { id: `ing-${Date.now()}`, type: 'k8s-ingress', position: { x: base.x + 100, y: base.y + 150 }, data: { label: 'Public Ingress', category: 'Kubernetes' }, parentId: vpc.id, style: { width: 168, height: 72 } };
            const svc = { id: `svc-${Date.now()}`, type: 'k8s-service', position: { x: base.x + 300, y: base.y + 150 }, data: { label: 'Cluster Svc', category: 'Kubernetes' }, parentId: vpc.id, style: { width: 168, height: 72 } };

            const deploy = { id: `dep-${Date.now()}`, type: 'k8s-deployment', position: { x: base.x + 500, y: base.y + 150 }, data: { label: 'Web Deploy', category: 'Kubernetes' }, parentId: vpc.id, style: { width: 192, height: 96 } };
            const pod1 = { id: `p1-${Date.now()}`, type: 'k8s-pod', position: { x: base.x + 750, y: base.y + 100 }, data: { label: 'Replica A', category: 'Kubernetes' }, parentId: vpc.id, style: { width: 144, height: 96 } };
            const pod2 = { id: `p2-${Date.now()}`, type: 'k8s-pod', position: { x: base.x + 750, y: base.y + 220 }, data: { label: 'Replica B', category: 'Kubernetes' }, parentId: vpc.id, style: { width: 144, height: 96 } };

            const argo = { id: `argo-${Date.now()}`, type: 'argocd', position: { x: base.x + vpc.style.width + 100, y: base.y + 100 }, data: { label: 'GitOps (ArgoCD)', category: 'CI/CD' }, style: { width: 168, height: 72 } };
            const actions = { id: `act-${Date.now()}`, type: 'github_actions', position: { x: base.x + vpc.style.width + 100, y: base.y + 200 }, data: { label: 'CI Pipeline', category: 'CI/CD' }, style: { width: 168, height: 72 } };

            newNodes = [region, vpc, ingress, svc, deploy, pod1, pod2, argo, actions];
            newEdges = [
                { id: `e-${Date.now()}-1`, source: ingress.id, target: svc.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-2`, source: svc.id, target: deploy.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-3`, source: deploy.id, target: pod1.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-4`, source: deploy.id, target: pod2.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-5`, source: actions.id, target: argo.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-6`, source: argo.id, target: deploy.id, type: 'step', style: { stroke: '#444', strokeWidth: 2, strokeDasharray: '5,5' } },
            ];
        } else if (templateType === 'template:fintech-saas') {
            const lb = { id: `lb-${Date.now()}`, type: 'loadBalancer', position: { x: base.x, y: base.y }, data: { label: 'Edge Gateway', category: 'Networking' }, style: { width: 192, height: 72 } };
            const auth = { id: `okta-${Date.now()}`, type: 'okta', position: { x: base.x + 240, y: base.y - 100 }, data: { label: 'Identity (Okta)', category: 'Security' }, style: { width: 168, height: 72 } };
            const api = { id: `api-${Date.now()}`, type: 'microservice', position: { x: base.x + 240, y: base.y + 50 }, data: { label: 'Transaction API', category: 'Compute' }, style: { width: 168, height: 72 } };

            const psql = { id: `psql-${Date.now()}`, type: 'database', position: { x: base.x + 480, y: base.y - 50 }, data: { label: 'Ledger DB', provider: 'postgresql', category: 'Data' }, style: { width: 144, height: 120 } };
            const stripe = { id: `stripe-${Date.now()}`, type: 'stripe', position: { x: base.x + 480, y: base.y + 150 }, data: { label: 'Processor', category: 'External' }, style: { width: 168, height: 72 } };

            const dd = { id: `dd-${Date.now()}`, type: 'datadog', position: { x: base.x + 720, y: base.y }, data: { label: 'Observability', category: 'Monitoring' }, style: { width: 168, height: 72 } };
            const twilio = { id: `tw-${Date.now()}`, type: 'twilio', position: { x: base.x + 720, y: base.y + 120 }, data: { label: '2FA (Twilio)', category: 'External' }, style: { width: 168, height: 72 } };

            newNodes = [lb, auth, api, psql, stripe, dd, twilio];
            newEdges = [
                { id: `e-${Date.now()}-1`, source: lb.id, target: auth.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-2`, source: lb.id, target: api.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-3`, source: api.id, target: psql.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-4`, source: api.id, target: stripe.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-5`, source: api.id, target: dd.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
                { id: `e-${Date.now()}-6`, source: api.id, target: twilio.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            ];
        }

        setNodes((nds) => nds.concat(newNodes));
        setEdges((eds) => eds.concat(newEdges));
    };

    const onDelete = (id: string) => {
        deleteNode(id);
    };

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

            const snappedPosition = {
                x: Math.round(position.x / 12) * 12,
                y: Math.round(position.y / 12) * 12
            };

            if (data.type.startsWith('template:')) {
                applyTemplate(data.type, snappedPosition);
            } else {
                addNode(data.type, data.label, snappedPosition);
            }
        },
        [screenToFlowPosition, addNode, takeSnapshot, setNodes, setEdges]
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



    const onNodeDragStart = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    const onNodeDragStop = useCallback((_: any, node: Node) => {
        // Find if this node was dropped inside a container
        // Containment logic for VPC, Region, and K8s Namespace
        const containers = nodes.filter(n => ['vpc', 'region', 'k8s-namespace'].includes(n.type!) && n.id !== node.id);

        // Current dragged node center (approximate using measured or style)
        const w = node.measured?.width || (node.style?.width as number) || 120;
        const h = node.measured?.height || (node.style?.height as number) || 80;
        const centerX = node.position.x + w / 2;
        const centerY = node.position.y + h / 2;

        const parent = containers.find(c => {
            const cw = (c.style?.width as number) || 0;
            const ch = (c.style?.height as number) || 0;
            return centerX >= c.position.x &&
                centerX <= c.position.x + cw &&
                centerY >= c.position.y &&
                centerY <= c.position.y + ch;
        });

        if (parent && node.parentId !== parent.id) {
            // Drop into new parent
            setNodes((nds) => nds.map((n) => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        parentId: parent.id,
                        // Note: Removing extent: 'parent' to allow dragging out
                        position: {
                            x: n.position.x - parent.position.x,
                            y: n.position.y - parent.position.y
                        }
                    };
                }
                return n;
            }));
        } else if (!parent && node.parentId) {
            // Dragged out of parent
            const parentNode = nodes.find(n => n.id === node.parentId);
            if (parentNode) {
                setNodes((nds) => nds.map((n) => {
                    if (n.id === node.id) {
                        return {
                            ...n,
                            parentId: undefined,
                            extent: undefined,
                            position: {
                                x: n.position.x + parentNode.position.x,
                                y: n.position.y + parentNode.position.y
                            }
                        };
                    }
                    return n;
                }));
            }
        }
    }, [nodes, setNodes]);

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
                        <Box className="w-5 h-5 text-white" />
                        <span className="font-sans font-black text-lg uppercase tracking-widest text-white/90">Weave Studio</span>
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
                    <ResizablePanel defaultSize={20} minSize={20} maxSize={30}>
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

                            <div className="flex-1 overflow-y-auto space-y-px scrollbar-hide">
                                {(() => {
                                    const categories = ['Templates', 'Kubernetes', 'Infrastructure', 'Compute', 'Networking', 'Data', 'CI/CD', 'Security', 'Monitoring', 'Analytics', 'External', 'Documentation', 'Utilities'];
                                    let hasAnyResults = false;

                                    const content = categories.map(category => {
                                        const searchKeywords = searchTerm.toLowerCase().split(' ').filter(k => k.length > 0);

                                        const categoryItems = nodeTypesList.filter(item => {
                                            const matchesCategory = item.category.toLowerCase() === category.toLowerCase();
                                            if (!matchesCategory) return false;

                                            if (searchKeywords.length === 0) return true;

                                            const targetText = `${item.label} ${item.type} ${item.category}`.toLowerCase();
                                            return searchKeywords.every(keyword => targetText.includes(keyword));
                                        }).sort((a, b) => a.label.localeCompare(b.label));

                                        if (categoryItems.length === 0) return null;
                                        hasAnyResults = true;

                                        // Auto-expand if searching, otherwise use state
                                        const isExpanded = searchTerm !== '' ? true : (expandedCategories[category] === true);

                                        return (
                                            <section key={category} className="border-b border-white/[0.03]">
                                                <button
                                                    onClick={() => toggleCategory(category)}
                                                    className="w-full h-10 flex items-center px-4 gap-2 transition-colors hover:bg-white/5 group"
                                                >
                                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? '' : '-rotate-90'} text-white/20`} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{category}</span>
                                                    <span className="ml-auto text-[9px] font-bold text-white/10">{categoryItems.length}</span>
                                                </button>

                                                {isExpanded && (
                                                    <div className="p-2 grid grid-cols-1 gap-1">
                                                        {categoryItems.map((item) => (
                                                            <button
                                                                key={item.type}
                                                                onClick={() => {
                                                                    const pos = { x: 100, y: 100 };
                                                                    if (item.type.startsWith('template:')) {
                                                                        applyTemplate(item.type, pos);
                                                                    } else {
                                                                        addNode(item.type, item.label, pos);
                                                                    }
                                                                }}
                                                                onDragStart={(e) => onDragStart(e, item.type, item.label)}
                                                                draggable
                                                                className="flex items-center gap-3 p-2 rounded-lg border border-transparent transition-all text-left group hover:bg-white/5 cursor-grab active:cursor-grabbing"
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
                                    });

                                    if (!hasAnyResults && searchTerm !== '') {
                                        return (
                                            <div className="flex flex-col items-center justify-center h-40 px-6 text-center">
                                                <Search className="w-8 h-8 text-white/5 mb-3" />
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-white/20">No components found</p>
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="mt-4 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                                                >
                                                    Clear Search
                                                </button>
                                            </div>
                                        );
                                    }

                                    return content;
                                })()
                                }
                            </div>
                        </aside>
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-black/5" />

                    <ResizablePanel defaultSize={60}>
                        <main
                            className="h-full relative transition-colors duration-300 bg-[#FDFCF8]"
                            data-cursor={drawingMode}
                        >
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onNodeClick={onNodeClick}
                                onNodeDoubleClick={onNodeDoubleClick}
                                onNodeDragStart={onNodeDragStart}
                                onNodeDragStop={onNodeDragStop}
                                onNodeContextMenu={onNodeContextMenu}
                                onPaneContextMenu={onPaneContextMenu as any}
                                onPaneClick={onPaneClick}
                                onDragOver={onDragOver}
                                onDrop={onDrop}
                                nodeTypes={nodeTypes}
                                fitView
                                style={{ cursor: 'inherit' }}
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
                                                <div className="px-3 py-1 text-[9px] uppercase font-bold text-black/20 tracking-widest">Layout</div>
                                                <button
                                                    onClick={() => {
                                                        takeSnapshot();
                                                        setNodes(nds => nds.map(n => {
                                                            if (n.selected || n.id === menu.id) {
                                                                const currentW = (n.style?.width as number) || n.measured?.width || 120;
                                                                const currentH = (n.style?.height as number) || n.measured?.height || 80;
                                                                return {
                                                                    ...n,
                                                                    position: {
                                                                        x: Math.round(n.position.x / 12) * 12,
                                                                        y: Math.round(n.position.y / 12) * 12
                                                                    },
                                                                    style: {
                                                                        ...n.style,
                                                                        width: Math.round(currentW / 24) * 24,
                                                                        height: Math.round(currentH / 24) * 24
                                                                    }
                                                                };
                                                            }
                                                            return n;
                                                        }));
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
                                                >
                                                    <Grid className="w-3.5 h-3.5" />
                                                    Straighten (Center & Snap)
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const selectedNodes = nodes.filter(n => n.selected || n.id === menu.id);
                                                        if (selectedNodes.length < 2) return;
                                                        takeSnapshot();

                                                        // Use first node as anchor
                                                        const anchor = selectedNodes[0];
                                                        const anchorW = (anchor.style?.width as number) || anchor.measured?.width || 0;
                                                        const targetCenterX = anchor.position.x + anchorW / 2;

                                                        setNodes(nds => nds.map(n => {
                                                            if (n.selected || n.id === menu.id) {
                                                                const w = (n.style?.width as number) || n.measured?.width || 0;
                                                                return {
                                                                    ...n,
                                                                    position: {
                                                                        ...n.position,
                                                                        x: Math.round((targetCenterX - w / 2) / 12) * 12
                                                                    }
                                                                };
                                                            }
                                                            return n;
                                                        }));
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
                                                >
                                                    <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
                                                    Align Centers (Vertical)
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const selectedNodes = nodes.filter(n => n.selected || n.id === menu.id);
                                                        if (selectedNodes.length < 2) return;
                                                        takeSnapshot();

                                                        const anchor = selectedNodes[0];
                                                        const anchorH = (anchor.style?.height as number) || anchor.measured?.height || 0;
                                                        const targetCenterY = anchor.position.y + anchorH / 2;

                                                        setNodes(nds => nds.map(n => {
                                                            if (n.selected || n.id === menu.id) {
                                                                const h = (n.style?.height as number) || n.measured?.height || 0;
                                                                return {
                                                                    ...n,
                                                                    position: {
                                                                        ...n.position,
                                                                        y: Math.round((targetCenterY - h / 2) / 12) * 12
                                                                    }
                                                                };
                                                            }
                                                            return n;
                                                        }));
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
                                                >
                                                    <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                                                    Align Centers (Horizontal)
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
                                            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                                {['Templates', 'Kubernetes', 'Infrastructure', 'Compute', 'Networking', 'Data', 'CI/CD', 'Security', 'Monitoring', 'Analytics', 'External', 'Documentation', 'Utilities'].map(category => {
                                                    const categoryItems = nodeTypesList.filter(n => n.category.toLowerCase() === category.toLowerCase());
                                                    if (categoryItems.length === 0) return null;

                                                    return (
                                                        <div key={category} className="py-1">
                                                            <div className="px-3 py-1 text-[9px] uppercase font-bold text-black/20 tracking-widest bg-black/[0.02]">
                                                                {category}
                                                            </div>
                                                            {categoryItems.map((node) => (
                                                                <button
                                                                    key={node.type}
                                                                    onClick={() => {
                                                                        const pos = screenToFlowPosition({ x: menu.left, y: menu.top });
                                                                        const snappedPos = {
                                                                            x: Math.round(pos.x / 12) * 12,
                                                                            y: Math.round(pos.y / 12) * 12
                                                                        };
                                                                        addNode(node.type, node.label, snappedPos);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
                                                                >
                                                                    <node.icon className="w-3.5 h-3.5" />
                                                                    {node.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>
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
                                    <button
                                        onClick={() => {
                                            setDrawingMode('select');
                                            fitView({ duration: 800 });
                                        }}
                                        className={`p-2.5 rounded-xl transition-all ${drawingMode === 'select' ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                        title="Selection Tool"
                                    >
                                        <MousePointer2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDrawingMode(drawingMode === 'infrastructure' ? 'select' : 'infrastructure')}
                                        className={`p-2.5 rounded-xl transition-all ${drawingMode === 'infrastructure' ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                        title="Infrastructure Tool (Click map to place VPC)"
                                    >
                                        <Square className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDrawingMode(drawingMode === 'annotation' ? 'select' : 'annotation')}
                                        className={`p-2.5 rounded-xl transition-all ${drawingMode === 'annotation' ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                        title="Annotation Tool (Click map to place)"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className={`p-2.5 rounded-xl transition-all ${edgeType ? 'bg-black/5 text-black' : 'text-black/40 hover:text-black hover:bg-black/5'}`} title="Line Type">
                                                {edgeType === 'step' && <Milestone className="w-4 h-4" />}
                                                {edgeType === 'smoothstep' && <Spline className="w-4 h-4" />}
                                                {edgeType === 'straight' && <Minus className="w-4 h-4 rotate-45" />}
                                                {edgeType === 'default' && <ArrowUpRight className="w-4 h-4" />}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-1 bg-white border border-black/10 rounded-xl shadow-2xl z-[150]" side="top" align="center" sideOffset={12}>
                                            <div className="flex gap-1 p-1">
                                                {[
                                                    { id: 'step', icon: Milestone },
                                                    { id: 'smoothstep', icon: Spline },
                                                    { id: 'straight', icon: Minus, rotate: true },
                                                    { id: 'default', icon: ArrowUpRight }
                                                ].map((tool) => (
                                                    <button
                                                        key={tool.id}
                                                        onClick={() => {
                                                            setEdgeType(tool.id as any);
                                                            // Apply to selected edges
                                                            setEdges(eds => eds.map(e => e.selected ? { ...e, type: tool.id } : e));
                                                        }}
                                                        className={`p-2 rounded-lg transition-all ${edgeType === tool.id ? 'bg-black text-white' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                                    >
                                                        <tool.icon className={`w-4 h-4 ${tool.rotate ? 'rotate-45' : ''}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <div className="h-5 w-px mx-1 bg-black/10" />
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className={`p-2.5 rounded-xl transition-all ${edgeStyle !== 'solid' || hasArrow ? 'bg-black/5 text-black' : 'text-black/40 hover:text-black hover:bg-black/5'}`} title="Line Style">
                                                <div className="relative">
                                                    <Minus className="w-4 h-4" />
                                                    {hasArrow && <ArrowRight className="w-2.5 h-2.5 absolute -right-1 -top-1 bg-white rounded-full p-0.5 border border-black/10" />}
                                                </div>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-1 bg-white border border-black/10 rounded-xl shadow-2xl z-[150]" side="top" align="center" sideOffset={12}>
                                            <div className="flex gap-1 p-1 items-center">
                                                {[
                                                    { id: 'solid', label: 'Solid', icon: Minus },
                                                    { id: 'dashed', label: 'Dashed', icon: Minus, className: 'border-b-2 border-dashed border-black/20 w-4 h-0 block mx-auto my-2' },
                                                    { id: 'dotted', label: 'Dotted', icon: Minus, className: 'border-b-2 border-dotted border-black/20 w-4 h-0 block mx-auto my-2' }
                                                ].map((style) => (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => {
                                                            setEdgeStyle(style.id as any);
                                                            // Apply to selected edges
                                                            setEdges(eds => eds.map(e => {
                                                                if (!e.selected) return e;
                                                                const s: any = { ...e.style, strokeDasharray: undefined };
                                                                if (style.id === 'dashed') s.strokeDasharray = '5 5';
                                                                if (style.id === 'dotted') s.strokeDasharray = '2 2';
                                                                return { ...e, style: s };
                                                            }));
                                                        }}
                                                        className={`flex items-center justify-between px-3 py-2 text-[12px] transition-colors rounded-lg ${edgeStyle === style.id ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5 hover:text-black'}`}
                                                    >
                                                        {style.id === 'solid' ? <Minus className="w-4 h-4" /> : <div className={`w-4 h-0.5 ${style.id === 'dashed' ? 'border-b-2 border-dashed' : 'border-b-2 border-dotted'} ${edgeStyle === style.id ? 'border-white' : 'border-black/40'}`} />}
                                                    </button>
                                                ))}
                                                <div className="h-4 w-px bg-black/10 mx-1" />
                                                <button
                                                    onClick={() => setHasArrow(!hasArrow)}
                                                    className={`p-2.5 rounded-lg transition-all ${hasArrow ? 'bg-amber-500 text-white shadow-lg' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                                    title="Toggle Arrow"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
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
                                                                min={24}
                                                                value={Math.round(Number(selectedNode.style?.width ?? (selectedNode as any).measured?.width ?? 0))}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    if (!isNaN(val) && val > 0) {
                                                                        updateNodeStyle(selectedNode.id, { width: val });
                                                                    }
                                                                }}
                                                                className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Height (PX)</div>
                                                            <Input
                                                                type="number"
                                                                min={24}
                                                                value={Math.round(Number(selectedNode.style?.height ?? (selectedNode as any).measured?.height ?? 0))}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    if (!isNaN(val) && val > 0) {
                                                                        updateNodeStyle(selectedNode.id, { height: val });
                                                                    }
                                                                }}
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

                                                        {/* Kubernetes Specific Properties */}
                                                        {selectedNode.type?.startsWith('k8s-') && (
                                                            <>
                                                                <div className="h-px bg-white/5 my-2" />
                                                                <div className="text-[9px] text-blue-400/60 uppercase font-bold tracking-widest flex items-center gap-1.5 mb-2">
                                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                                                        <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
                                                                    </svg>
                                                                    Kubernetes
                                                                </div>

                                                                {/* Status */}
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[9px] text-white/20 uppercase font-bold">Status</div>
                                                                    <select
                                                                        value={(selectedNode.data?.status as string) || ''}
                                                                        onChange={(e) => updateNodeData(selectedNode.id, { status: e.target.value || undefined })}
                                                                        className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                                                    >
                                                                        <option value="" className="bg-[#1a1a1a]">Default (K8s Blue)</option>
                                                                        <option value="healthy" className="bg-[#1a1a1a]">✅ Healthy</option>
                                                                        <option value="error" className="bg-[#1a1a1a]">❌ Error</option>
                                                                        <option value="pending" className="bg-[#1a1a1a]">⏳ Pending</option>
                                                                    </select>
                                                                </div>

                                                                {/* Replicas — for Deployment, ReplicaSet, StatefulSet, DaemonSet */}
                                                                {['k8s-deployment', 'k8s-replicaset', 'k8s-statefulset', 'k8s-daemonset'].includes(selectedNode.type!) && (
                                                                    <div className="space-y-1.5">
                                                                        <div className="text-[9px] text-white/20 uppercase font-bold">Replicas</div>
                                                                        <Input
                                                                            type="number"
                                                                            min={0}
                                                                            value={(selectedNode.data?.replicas as number) || 1}
                                                                            onChange={(e) => updateNodeData(selectedNode.id, { replicas: parseInt(e.target.value) || 1 })}
                                                                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Image — for Pod, Deployment, StatefulSet, DaemonSet, Job, CronJob */}
                                                                {['k8s-pod', 'k8s-deployment', 'k8s-statefulset', 'k8s-daemonset', 'k8s-job', 'k8s-cronjob'].includes(selectedNode.type!) && (
                                                                    <div className="space-y-1.5">
                                                                        <div className="text-[9px] text-white/20 uppercase font-bold">Container Image</div>
                                                                        <Input
                                                                            value={(selectedNode.data?.image as string) || ''}
                                                                            onChange={(e) => updateNodeData(selectedNode.id, { image: e.target.value })}
                                                                            placeholder="nginx:latest"
                                                                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] font-mono"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Service Type & Port */}
                                                                {selectedNode.type === 'k8s-service' && (
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="space-y-1.5">
                                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Service Type</div>
                                                                            <select
                                                                                value={(selectedNode.data?.serviceType as string) || 'ClusterIP'}
                                                                                onChange={(e) => updateNodeData(selectedNode.id, { serviceType: e.target.value })}
                                                                                className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                                                            >
                                                                                <option value="ClusterIP" className="bg-[#1a1a1a]">ClusterIP</option>
                                                                                <option value="NodePort" className="bg-[#1a1a1a]">NodePort</option>
                                                                                <option value="LoadBalancer" className="bg-[#1a1a1a]">LoadBalancer</option>
                                                                                <option value="ExternalName" className="bg-[#1a1a1a]">ExternalName</option>
                                                                            </select>
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Port</div>
                                                                            <Input
                                                                                value={(selectedNode.data?.port as string) || '80'}
                                                                                onChange={(e) => updateNodeData(selectedNode.id, { port: e.target.value })}
                                                                                className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Ingress — Host & Path */}
                                                                {selectedNode.type === 'k8s-ingress' && (
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="space-y-1.5">
                                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Host</div>
                                                                            <Input
                                                                                value={(selectedNode.data?.host as string) || ''}
                                                                                onChange={(e) => updateNodeData(selectedNode.id, { host: e.target.value })}
                                                                                placeholder="app.example.com"
                                                                                className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] font-mono"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Path</div>
                                                                            <Input
                                                                                value={(selectedNode.data?.path as string) || '/'}
                                                                                onChange={(e) => updateNodeData(selectedNode.id, { path: e.target.value })}
                                                                                className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] font-mono"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* PVC — Storage Size & Access Mode */}
                                                                {selectedNode.type === 'k8s-pvc' && (
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="space-y-1.5">
                                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Storage Size</div>
                                                                            <Input
                                                                                value={(selectedNode.data?.storageSize as string) || '10Gi'}
                                                                                onChange={(e) => updateNodeData(selectedNode.id, { storageSize: e.target.value })}
                                                                                className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Access Mode</div>
                                                                            <select
                                                                                value={(selectedNode.data?.accessMode as string) || 'ReadWriteOnce'}
                                                                                onChange={(e) => updateNodeData(selectedNode.id, { accessMode: e.target.value })}
                                                                                className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                                                            >
                                                                                <option value="ReadWriteOnce" className="bg-[#1a1a1a]">ReadWriteOnce</option>
                                                                                <option value="ReadOnlyMany" className="bg-[#1a1a1a]">ReadOnlyMany</option>
                                                                                <option value="ReadWriteMany" className="bg-[#1a1a1a]">ReadWriteMany</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* CronJob — Schedule */}
                                                                {selectedNode.type === 'k8s-cronjob' && (
                                                                    <div className="space-y-1.5">
                                                                        <div className="text-[9px] text-white/20 uppercase font-bold">Schedule (Cron)</div>
                                                                        <Input
                                                                            value={(selectedNode.data?.schedule as string) || '*/5 * * * *'}
                                                                            onChange={(e) => updateNodeData(selectedNode.id, { schedule: e.target.value })}
                                                                            placeholder="*/5 * * * *"
                                                                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] font-mono"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* HPA — Min/Max Replicas & Target CPU */}
                                                                {selectedNode.type === 'k8s-hpa' && (
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        <div className="space-y-1.5">
                                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Min</div>
                                                                            <Input
                                                                                type="number"
                                                                                min={1}
                                                                                value={(selectedNode.data?.minReplicas as number) || 1}
                                                                                onChange={(e) => updateNodeData(selectedNode.id, { minReplicas: parseInt(e.target.value) || 1 })}
                                                                                className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <div className="text-[9px] text-white/20 uppercase font-bold">Max</div>
                                                                            <Input
                                                                                type="number"
                                                                                min={1}
                                                                                value={(selectedNode.data?.maxReplicas as number) || 10}
                                                                                onChange={(e) => updateNodeData(selectedNode.id, { maxReplicas: parseInt(e.target.value) || 10 })}
                                                                                className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <div className="text-[9px] text-white/20 uppercase font-bold">CPU %</div>
                                                                            <Input
                                                                                type="number"
                                                                                min={1}
                                                                                max={100}
                                                                                value={(selectedNode.data?.targetCpu as number) || 80}
                                                                                onChange={(e) => updateNodeData(selectedNode.id, { targetCpu: parseInt(e.target.value) || 80 })}
                                                                                className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
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
