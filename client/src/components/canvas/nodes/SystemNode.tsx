import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import {
    User as UserIcon,
    Type,
    Circle
} from 'lucide-react';
import { k8sIcons } from '../icons/KubernetesIcons';

// ─────────────────────────────────────────────────────────────
// Per-node-type brand mapping — every node gets a unique logo & color
// Logos from https://cdn.simpleicons.org/:slug/white
// ─────────────────────────────────────────────────────────────
interface NodeBrand {
    logo: string;
    color: string;
    borderColor: string;
    label: string;
}

const nodeBrands: Record<string, NodeBrand> = {
    // ── Compute ──
    server: { logo: 'https://cdn.simpleicons.org/linux/white', color: '#1A1A2E', borderColor: '#333355', label: 'SERVER' },
    microservice: { logo: 'https://cdn.simpleicons.org/docker/white', color: '#2496ED', borderColor: '#1A7BC9', label: 'DOCKER' },
    worker: { logo: 'https://cdn.simpleicons.org/celery/white', color: '#37814A', borderColor: '#2C6A3C', label: 'WORKER' },
    logic: { logo: 'https://cdn.simpleicons.org/awslambda/white', color: '#FF9900', borderColor: '#CC7A00', label: 'LAMBDA' },

    // ── Data ──
    database: { logo: 'https://cdn.simpleicons.org/postgresql/white', color: '#4169E1', borderColor: '#3050B0', label: 'DATABASE' },
    cache: { logo: 'https://cdn.simpleicons.org/redis/white', color: '#FF4438', borderColor: '#CC362D', label: 'REDIS' },
    storage: { logo: 'https://cdn.simpleicons.org/amazons3/white', color: '#569A31', borderColor: '#457B27', label: 'S3' },
    search: { logo: 'https://cdn.simpleicons.org/elasticsearch/white', color: '#005571', borderColor: '#003F55', label: 'ELASTIC' },
    influxdb: { logo: 'https://cdn.simpleicons.org/influxdb/white', color: '#22ADF6', borderColor: '#1B8AC5', label: 'INFLUXDB' },
    snowflake: { logo: 'https://cdn.simpleicons.org/snowflake/white', color: '#29B5E8', borderColor: '#2191BA', label: 'SNOWFLAKE' },
    clickhouse: { logo: 'https://cdn.simpleicons.org/clickhouse/white', color: '#FFCC01', borderColor: '#CCA301', label: 'CLICKHOUSE' },

    // ── Networking ──
    gateway: { logo: 'https://cdn.simpleicons.org/amazonapigateway/white', color: '#FF4F8B', borderColor: '#CC3F6F', label: 'GATEWAY' },
    loadBalancer: { logo: 'https://cdn.simpleicons.org/nginx/white', color: '#009639', borderColor: '#00782E', label: 'NGINX' },
    cdn: { logo: 'https://cdn.simpleicons.org/cloudflare/white', color: '#F38020', borderColor: '#C2661A', label: 'CDN' },
    bus: { logo: 'https://cdn.simpleicons.org/apachekafka/white', color: '#231F20', borderColor: '#444444', label: 'KAFKA' },
    queue: { logo: 'https://cdn.simpleicons.org/rabbitmq/white', color: '#FF6600', borderColor: '#CC5200', label: 'RABBITMQ' },
    route53: { logo: 'https://cdn.simpleicons.org/amazonroute53/white', color: '#8C4FFF', borderColor: '#703FCC', label: 'ROUTE 53' },
    nats: { logo: 'https://cdn.simpleicons.org/nats/white', color: '#27AAE1', borderColor: '#1F88B0', label: 'NATS' },
    socketio: { logo: 'https://cdn.simpleicons.org/socketdotio/white', color: '#010101', borderColor: '#333333', label: 'SOCKET.IO' },
    pusher: { logo: 'https://cdn.simpleicons.org/pusher/white', color: '#300D4F', borderColor: '#260A3F', label: 'PUSHER' },

    // ── CI/CD ──
    github_actions: { logo: 'https://cdn.simpleicons.org/githubactions/white', color: '#2088FF', borderColor: '#1A6DCC', label: 'GH ACTIONS' },
    jenkins: { logo: 'https://cdn.simpleicons.org/jenkins/white', color: '#D24939', borderColor: '#A83A2E', label: 'JENKINS' },
    circleci: { logo: 'https://cdn.simpleicons.org/circleci/white', color: '#343434', borderColor: '#2A2A2A', label: 'CIRCLECI' },
    gitlab: { logo: 'https://cdn.simpleicons.org/gitlab/white', color: '#FC6D26', borderColor: '#C9571E', label: 'GITLAB' },
    argocd: { logo: 'https://cdn.simpleicons.org/argocd/white', color: '#EF7B4D', borderColor: '#BF623D', label: 'ARGO CD' },

    // ── Security ──
    vault: { logo: 'https://cdn.simpleicons.org/hashicorpvault/white', color: '#60BEA3', borderColor: '#4D9882', label: 'VAULT' },
    auth0: { logo: 'https://cdn.simpleicons.org/auth0/white', color: '#EB5424', borderColor: '#BC431D', label: 'AUTH0' },
    okta: { logo: 'https://cdn.simpleicons.org/okta/white', color: '#007DC1', borderColor: '#00649A', label: 'OKTA' },
    waf: { logo: 'https://cdn.simpleicons.org/cloudflare/white', color: '#F38020', borderColor: '#C2661A', label: 'WAF' },

    // ── Monitoring ──
    prometheus: { logo: 'https://cdn.simpleicons.org/prometheus/white', color: '#E6522C', borderColor: '#B84123', label: 'PROMETHEUS' },
    grafana: { logo: 'https://cdn.simpleicons.org/grafana/white', color: '#F46800', borderColor: '#C35300', label: 'GRAFANA' },
    datadog: { logo: 'https://cdn.simpleicons.org/datadog/white', color: '#632CA6', borderColor: '#4F2385', label: 'DATADOG' },

    // ── Infrastructure ──
    vpc: { logo: 'https://cdn.simpleicons.org/amazonaws/white', color: '#232F3E', borderColor: '#3A4A5C', label: 'VPC' },
    region: { logo: 'https://cdn.simpleicons.org/amazonaws/white', color: '#232F3E', borderColor: '#3A4A5C', label: 'REGION' },

    // ── External Services ──
    user: { logo: '', color: '#6366F1', borderColor: '#4F46E5', label: 'USER' },
    app: { logo: 'https://cdn.simpleicons.org/react/white', color: '#20232A', borderColor: '#383A45', label: 'APP' },
    api: { logo: 'https://cdn.simpleicons.org/openapi/white', color: '#6BA539', borderColor: '#55842E', label: 'API' },
    stripe: { logo: 'https://cdn.simpleicons.org/stripe/white', color: '#008CDD', borderColor: '#0070B1', label: 'STRIPE' },
    twilio: { logo: 'https://cdn.simpleicons.org/twilio/white', color: '#F22F46', borderColor: '#C12538', label: 'TWILIO' },
    sendgrid: { logo: 'https://cdn.simpleicons.org/sendgrid/white', color: '#1A82E2', borderColor: '#1568B5', label: 'SENDGRID' },
    shopify: { logo: 'https://cdn.simpleicons.org/shopify/white', color: '#7AB55C', borderColor: '#619149', label: 'SHOPIFY' },
    paypal: { logo: 'https://cdn.simpleicons.org/paypal/white', color: '#003087', borderColor: '#00266B', label: 'PAYPAL' },
};

const providerBrands: Record<string, NodeBrand> = {
    postgresql: { logo: 'https://cdn.simpleicons.org/postgresql/white', color: '#4169E1', borderColor: '#3050B0', label: 'POSTGRESQL' },
    mongodb: { logo: 'https://cdn.simpleicons.org/mongodb/white', color: '#47A248', borderColor: '#3D8B3E', label: 'MONGODB' },
    mysql: { logo: 'https://cdn.simpleicons.org/mysql/white', color: '#4479A1', borderColor: '#366080', label: 'MYSQL' },
    redis: { logo: 'https://cdn.simpleicons.org/redis/white', color: '#FF4438', borderColor: '#CC362D', label: 'REDIS' },
    oracle: { logo: 'https://cdn.simpleicons.org/oracle/white', color: '#F80000', borderColor: '#C60000', label: 'ORACLE' },
    dynamodb: { logo: 'https://cdn.simpleicons.org/amazondynamodb/white', color: '#4053D6', borderColor: '#3342AB', label: 'DYNAMODB' },
};

export function SystemNode({ data, selected, type, width, height }: NodeProps) {
    const provider = (data.provider as string || '').toLowerCase();
    const isInfrastructure = type === 'vpc' || type === 'region';
    const isNote = type === 'note';
    const isKubernetes = (type as string)?.startsWith('k8s-');
    const isK8sNamespace = type === 'k8s-namespace';
    const isData = (data.category as string || '').toLowerCase() === 'data';
    const k8sStatus = (data.status as string) || '';

    // Calculate dynamic font sizes based on container width
    const zoneLabelSize = width ? Math.max(9, Math.floor(width / 40)) : 9;
    const zoneIconSize = width ? Math.max(12, Math.floor(width / 30)) : 12;

    const brand: NodeBrand = isKubernetes
        ? { logo: 'https://cdn.simpleicons.org/kubernetes/white', color: '#326CE5', borderColor: '#2457B5', label: (type as string)?.replace('k8s-', '').toUpperCase() || 'K8S' }
        : (providerBrands[provider] || nodeBrands[type as string] || { logo: '', color: '#4F46E5', borderColor: '#4338CA', label: (type as string || 'NODE').toUpperCase() });

    const statusOverrides: Record<string, { color: string; borderColor: string }> = {
        healthy: { color: '#22C55E', borderColor: '#16A34A' },
        error: { color: '#EF4444', borderColor: '#DC2626' },
        pending: { color: '#6B7280', borderColor: '#4B5563' },
    };
    const statusBrand = isKubernetes && k8sStatus ? statusOverrides[k8sStatus] : null;
    const finalColor = statusBrand?.color || brand.color;
    const finalBorder = statusBrand?.borderColor || brand.borderColor;

    let K8sResourceIcon: React.ReactNode = null;
    if (isKubernetes) {
        const K8sIcon = k8sIcons[type as string];
        K8sResourceIcon = K8sIcon ? <K8sIcon size={14} className="text-white/60" /> : null;
    }

    // ── Junction Point ──
    if (type === 'junction') {
        return (
            <div className="relative w-6 h-6 group">
                <div className={`
                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all border-2
                    ${selected ? 'bg-black border-black ring-4 ring-black/5' : 'bg-white border-black/40 group-hover:border-black'}
                `} />
                <Handle type="target" position={Position.Top} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} className="!opacity-0 !w-full !h-full !border-0" />
                <Handle type="source" position={Position.Top} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} className="!opacity-0 !w-full !h-full !border-0" />
            </div>
        );
    }

    // Shared handle style — sharp square handles that match the resize edges
    const handleCls = "!w-2 !h-2 !rounded-none !border-2 !border-blue-500 !bg-white !opacity-0 group-hover:!opacity-100 !transition-opacity !shadow-sm";

    return (
        <>
            <NodeResizer
                minWidth={24}
                minHeight={24}
                isVisible={selected}
                lineClassName={isNote ? "!border-yellow-500" : "!border-blue-500"}
                lineStyle={{ padding: 6 }}
                handleClassName="!h-3 !w-3 !bg-white !border-2 !border-blue-500 !rounded-none !shadow-md"
                handleStyle={{ margin: -6 }}
            />
            <div className="group w-full h-full relative">
                {/* Connection Handles — sharp squares */}
                <Handle type="target" position={Position.Top} id="t-t" className={handleCls} />
                <Handle type="source" position={Position.Top} id="t-s" className={handleCls} />
                <Handle type="target" position={Position.Bottom} id="b-t" className={handleCls} />
                <Handle type="source" position={Position.Bottom} id="b-s" className={handleCls} />
                <Handle type="target" position={Position.Left} id="l-t" className={handleCls} />
                <Handle type="source" position={Position.Left} id="l-s" className={handleCls} />
                <Handle type="target" position={Position.Right} id="r-t" className={handleCls} />
                <Handle type="source" position={Position.Right} id="r-s" className={handleCls} />

                {/* ── PLAIN TEXT ANNOTATION ── */}
                {type === 'annotation' ? (
                    <div
                        className={`
                            relative w-full h-full flex flex-col p-2
                            ${selected ? 'border-2 border-blue-500/30 bg-blue-500/5' : 'border-2 border-transparent group-hover:border-black/5'}
                            transition-all cursor-text
                        `}
                    >
                        <p
                            className="leading-tight font-medium whitespace-pre-wrap break-all w-full max-w-full text-black/80 font-sans"
                            style={{ fontSize: `${Math.max(14, Math.floor((width || 160) / 10))}px` }}
                        >
                            {(data.label as string) || 'Annotation'}
                        </p>
                    </div>

                    /* ── STICKY NOTE ── */
                ) : isNote ? (
                    <div
                        className={`
                            relative p-4 border-2 overflow-hidden w-full h-full flex flex-col
                            bg-gradient-to-br from-[#FFF9C4] to-[#FFF176] border-yellow-400/50
                            ${selected ? 'shadow-[6px_6px_0px_rgba(0,0,0,0.12)]' : 'group-hover:shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'}
                        `}
                    >
                        <p
                            className="leading-relaxed font-semibold whitespace-pre-wrap break-all italic w-full max-w-full text-yellow-900/80"
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: `${Math.max(14, Math.floor((width || 192) / 12))}px`
                            }}
                        >
                            {(data.label as string) || ''}
                        </p>
                    </div>

                    /* ── INFRASTRUCTURE CONTAINERS (VPC / Region) ── */
                ) : isInfrastructure ? (
                    <div
                        className={`
                            relative border-2 border-dashed overflow-hidden w-full h-full flex flex-col
                            ${selected ? 'shadow-[6px_6px_0px_rgba(0,0,0,0.06)]' : ''}
                        `}
                        style={{
                            backgroundColor: `${finalColor}08`,
                            borderColor: `${finalColor}40`,
                        }}
                    >
                        {/* Zone label — relative, inside the container */}
                        <div className="flex items-center gap-2 px-3 py-1.5 self-start" style={{ padding: `${zoneLabelSize / 2}px` }}>
                            <div
                                className="px-2 py-0.5 font-black uppercase tracking-[0.15em] text-white flex items-center gap-2"
                                style={{
                                    backgroundColor: finalColor,
                                    fontSize: `${zoneLabelSize}px`
                                }}
                            >
                                {brand.logo && (
                                    <img
                                        src={brand.logo}
                                        className="object-contain"
                                        style={{ width: zoneIconSize, height: zoneIconSize }}
                                        alt=""
                                    />
                                )}
                                {brand.label}: {data.label as string}
                            </div>
                        </div>
                    </div>

                    /* ── K8S NAMESPACE CONTAINER ── */
                ) : isK8sNamespace ? (
                    <div
                        className={`
                            relative border-2 border-dashed overflow-hidden w-full h-full flex flex-col
                            ${selected ? 'bg-[#326CE5]/10 border-[#326CE5]/60 shadow-[6px_6px_0px_rgba(50,108,229,0.08)]' : 'bg-[#326CE5]/5 border-[#326CE5]/40 hover:bg-[#326CE5]/8'}
                        `}
                    >
                        {/* Namespace label — relative, inside the container */}
                        <div className="flex items-center gap-2 px-3 py-1.5 self-start" style={{ padding: `${zoneLabelSize / 2}px` }}>
                            <div
                                className="px-2 py-0.5 bg-[#326CE5] font-black uppercase tracking-[0.15em] text-white flex items-center gap-1.5"
                                style={{ fontSize: `${zoneLabelSize}px` }}
                            >
                                <img
                                    src="https://cdn.simpleicons.org/kubernetes/white"
                                    style={{ width: zoneIconSize, height: zoneIconSize }}
                                    className="object-contain"
                                    alt=""
                                />
                                ns: {data.label as string}
                            </div>
                        </div>
                    </div>

                    /* ── KUBERNETES NODES ── */
                ) : isKubernetes ? (
                    <div
                        className={`
                            relative p-3 border-2 overflow-hidden w-full h-full flex items-center gap-3
                            ${selected ? 'shadow-[6px_6px_0px_rgba(50,108,229,0.15)]' : 'group-hover:shadow-[3px_3px_0px_rgba(50,108,229,0.08)]'}
                            transition-shadow
                        `}
                        style={{
                            backgroundColor: finalColor,
                            borderColor: finalBorder,
                        }}
                    >
                        {/* K8s helm watermark */}
                        <img
                            src="https://cdn.simpleicons.org/kubernetes/white"
                            className="absolute right-2 bottom-2 w-8 h-8 object-contain opacity-[0.06] pointer-events-none"
                            alt=""
                        />

                        {/* Logo container — sharp square */}
                        <div className="relative w-10 h-10 bg-white/15 flex items-center justify-center flex-shrink-0">
                            <img src={brand.logo} className="w-5 h-5 object-contain" alt="" />
                            {K8sResourceIcon && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white/20 flex items-center justify-center">
                                    {K8sResourceIcon}
                                </div>
                            )}
                            {k8sStatus && (
                                <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white/80
                                    ${k8sStatus === 'healthy' ? 'bg-green-400' : k8sStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'}
                                `}>
                                    <div className="k8s-status-pulse" />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[12px] font-bold truncate leading-tight text-white">
                                {data.label as string}
                            </span>
                            <span className="text-[8px] uppercase tracking-[0.15em] font-black mt-0.5 text-white/50">
                                {brand.label}
                            </span>
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                                {Boolean(data.replicas) && (
                                    <span className="text-[7px] px-1.5 py-0.5 bg-white/10 text-white/80 font-bold uppercase">
                                        {String(data.replicas)} replicas
                                    </span>
                                )}
                                {Boolean(data.image) && (
                                    <span className="text-[7px] px-1.5 py-0.5 bg-white/10 text-white/80 font-mono truncate max-w-[100px]">
                                        {String(data.image)}
                                    </span>
                                )}
                                {Boolean(data.serviceType) && (
                                    <span className="text-[7px] px-1.5 py-0.5 bg-white/10 text-white/80 font-bold uppercase">
                                        {String(data.serviceType)}
                                    </span>
                                )}
                                {Boolean(data.schedule) && (
                                    <span className="text-[7px] px-1.5 py-0.5 bg-white/10 text-white/80 font-mono">
                                        {String(data.schedule)}
                                    </span>
                                )}
                                {Boolean(data.storageSize) && (
                                    <span className="text-[7px] px-1.5 py-0.5 bg-white/10 text-white/80 font-bold">
                                        {String(data.storageSize)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    /* ── DEFAULT NODES (Compute, Data, Networking, External) ── */
                ) : (
                    <div
                        className={`
                            relative p-3 border-2 overflow-hidden w-full h-full
                            ${isData ? 'flex flex-col items-center text-center' : 'flex items-center gap-3'}
                            ${selected ? 'shadow-[6px_6px_0px_rgba(0,0,0,0.12)]' : 'group-hover:shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'}
                            transition-shadow
                        `}
                        style={{
                            backgroundColor: finalColor,
                            borderColor: finalBorder,
                        }}
                    >
                        {/* Logo container — sharp square */}
                        <div className={`
                            relative bg-white/15 flex items-center justify-center flex-shrink-0
                            ${isData ? 'w-12 h-12 mb-1' : 'w-10 h-10'}
                        `}>
                            {brand.logo ? (
                                <img
                                    src={brand.logo}
                                    className={`object-contain ${isData ? 'w-6 h-6' : 'w-5 h-5'}`}
                                    alt=""
                                />
                            ) : type === 'user' ? (
                                <UserIcon size={isData ? 24 : 18} strokeWidth={2} className="text-white" />
                            ) : (
                                <div className="w-5 h-5 bg-white/30" />
                            )}
                        </div>

                        <div className="flex flex-col min-w-0">
                            <span className="text-[12px] font-bold truncate leading-tight text-white">
                                {data.label as string}
                            </span>
                            <span className="text-[8px] uppercase tracking-[0.15em] font-black mt-0.5 text-white/50">
                                {brand.label}
                            </span>
                        </div>

                        {/* Sub-Collections for Data nodes */}
                        {isData && Array.isArray(data.collections) && data.collections.length > 0 && (
                            <div className="mt-2 w-full space-y-1 flex-grow overflow-hidden">
                                <div className="text-[7px] uppercase tracking-[0.15em] font-black text-white/25 mb-1">Collections</div>
                                <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[200px] pr-1 scrollbar-hide">
                                    {(data.collections as any[]).map((coll, i) => (
                                        <div key={i} className="px-2 py-1 bg-white/10 border border-white/5 text-[9px] font-medium text-white truncate flex items-center gap-1.5 shrink-0">
                                            <div className="w-1 h-1 bg-white/40" />
                                            {String(coll)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
