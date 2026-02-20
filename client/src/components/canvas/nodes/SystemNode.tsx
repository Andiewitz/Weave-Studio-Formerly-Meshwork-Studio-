import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import {
    Server,
    Database,
    Cpu,
    Globe,
    MessageSquare,
    HardDrive,
    Zap,
    Box,
    Share2,
    Search,
    User as UserIcon,
    Type,
    Circle
} from 'lucide-react';

const icons: Record<string, any> = {
    server: Server,
    database: Database,
    loadBalancer: Cpu,
    gateway: Globe,
    queue: MessageSquare,
    storage: HardDrive,
    logic: Zap,
    cdn: Globe,
    microservice: Box,
    worker: Cpu,
    cache: Zap,
    search: Search,
    bus: Share2,
    user: UserIcon,
    app: Box,
    api: Globe,
    note: Type,
    junction: Circle,
    postgresql: Database,
    mongodb: Box,
    mysql: Database,
    redis: Zap,
    oracle: Database,
    dynamodb: HardDrive,
};

export function SystemNode({ data, selected, type }: NodeProps) {
    // Category-specific dimensions (multiples of 12)
    const dimensions: Record<string, { w: string, h: string }> = {
        compute: { w: 'w-[168px]', h: 'h-[72px]' },
        data: { w: 'w-[144px]', h: 'h-[120px]' }, // Cylindrical feel
        networking: { w: 'w-[192px]', h: 'h-[60px]' },
        external: { w: 'w-[120px]', h: 'h-[96px]' },
        infrastructure: { w: 'w-full', h: 'h-full' },
        documentation: { w: 'w-[192px]', h: 'h-auto' },
        utilities: { w: 'w-6', h: 'h-6' }
    };

    const category = (data.category as string || '').toLowerCase();
    const dim = dimensions[category] || dimensions.compute;

    // Premium Color Palette
    const categoryStyles: Record<string, { bg: string, border: string, text: string, icon: string }> = {
        compute: { bg: 'bg-[#4F46E5]', border: 'border-[#4338CA]', text: 'text-white', icon: 'text-indigo-100' },
        data: { bg: 'bg-[#F59E0B]', border: 'border-[#D97706]', text: 'text-white', icon: 'text-amber-100' },
        networking: { bg: 'bg-[#10B981]', border: 'border-[#059669]', text: 'text-white', icon: 'text-emerald-100' },
        external: { bg: 'bg-[#8B5CF6]', border: 'border-[#7C3AED]', text: 'text-white', icon: 'text-purple-100' },
        infrastructure: { bg: 'bg-white', border: 'border-black', text: 'text-black', icon: 'text-black/40' },
        documentation: { bg: 'bg-[#FFF9C4]', border: 'border-yellow-400', text: 'text-yellow-900', icon: 'text-yellow-700/50' },
        utilities: { bg: 'bg-white', border: 'border-black', text: 'text-black', icon: 'text-black/40' }
    };

    // Provider Specific Branding (High Fidelity)
    const providerStyles: Record<string, { bg: string, border: string, logo?: React.ReactNode, radius?: string }> = {
        postgresql: {
            bg: 'bg-[#336791]',
            border: 'border-[#244e6d]',
            logo: <img src="https://cdn.simpleicons.org/postgresql/white" className="w-10 h-10 object-contain" alt="PostgreSQL" />
        },
        mongodb: {
            bg: 'bg-[#47A248]',
            border: 'border-[#3d8b3e]',
            logo: <img src="https://cdn.simpleicons.org/mongodb/white" className="w-10 h-10 object-contain" alt="MongoDB" />
        },
        redis: {
            bg: 'bg-[#D82C20]',
            border: 'border-[#b1241a]',
            radius: 'rounded-lg',
            logo: <img src="https://cdn.simpleicons.org/redis/white" className="w-10 h-10 object-contain" alt="Redis" />
        },
        mysql: {
            bg: 'bg-[#00758F]',
            border: 'border-[#005c70]',
            logo: <img src="https://cdn.simpleicons.org/mysql/white" className="w-10 h-10 object-contain" alt="MySQL" />
        },
        oracle: {
            bg: 'bg-[#F80000]',
            border: 'border-[#cc0000]',
            logo: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/512px-Oracle_logo.svg.png" className="w-10 h-3 object-contain brightness-0 invert" alt="Oracle" />
        },
        dynamodb: {
            bg: 'bg-[#2E27AD]',
            border: 'border-[#251f8a]',
            logo: <img src="https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/master/dist/Database/AmazonDynamoDB.png" className="w-10 h-10 object-contain" alt="DynamoDB" />
        },
    };

    const style = categoryStyles[category] || categoryStyles.compute;
    const provider = (data.provider as string || '').toLowerCase();
    const customBrand = providerStyles[provider];

    const isData = category === 'data';
    const isInfrastructure = type === 'vpc' || type === 'region';
    const isNote = type === 'note';

    // Handle Specialized Icons/Logos
    let IconElement: React.ReactNode;
    if (customBrand?.logo) {
        IconElement = customBrand.logo;
    } else {
        const Icon = icons[provider] || icons[type as string] || Box;
        IconElement = <Icon size={isData ? 24 : 18} strokeWidth={selected ? 2.5 : 2} />;
    }

    const borderRadius = customBrand?.radius || (type === 'junction' ? 'rounded-full' : 'rounded-xl');

    // Dynamic styling: use min dimensions for default state, 100% to fill resized container
    const nodeStyle: React.CSSProperties = {
        minWidth: (dim.w.match(/\[(.*?)px\]/)?.[1] ? `${dim.w.match(/\[(.*?)px\]/)?.[1]}px` : undefined),
        minHeight: (dim.h.match(/\[(.*?)px\]/)?.[1] ? `${dim.h.match(/\[(.*?)px\]/)?.[1]}px` : undefined),
    };

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

    return (
        <>
            <NodeResizer
                minWidth={120}
                minHeight={48}
                isVisible={selected}
                lineClassName={isNote ? "border-yellow-400" : "border-white/40"}
                handleClassName="h-3 w-3 bg-white border-2 border-primary rounded-full shadow-md"
            />
            <div
                style={{
                    ...nodeStyle,
                    transform: isNote ? 'rotate(-0.5deg)' : undefined,
                }}
                className={`
                    group relative p-3 transition-all duration-200 border-2
                    h-full w-full
                    ${customBrand ? `${customBrand.bg} ${customBrand.border}` : `${style.bg} ${style.border}`}
                    ${selected ? 'shadow-[8px_8px_0px_rgba(0,0,0,0.1)] scale-[1.01]' : 'hover:scale-[1.005]'}
                    ${isNote ? 'rounded-sm' : borderRadius}
                    ${isInfrastructure ? 'bg-opacity-5' : ''}
                    flex flex-col
                `}
            >
                {/* All-Direction Handles */}
                <Handle type="target" position={Position.Top} id="t-t" className="!w-3 !h-3 !border-0 !bg-white/20 hover:!bg-white !top-0 !translate-y-[-50%]" />
                <Handle type="source" position={Position.Top} id="t-s" className="!w-3 !h-3 !border-0 !bg-white/20 hover:!bg-white !top-0 !translate-y-[-50%]" />
                <Handle type="target" position={Position.Bottom} id="b-t" className="!w-3 !h-3 !border-0 !bg-white/20 hover:!bg-white !bottom-0 !translate-y-[50%]" />
                <Handle type="source" position={Position.Bottom} id="b-s" className="!w-3 !h-3 !border-0 !bg-white/20 hover:!bg-white !bottom-0 !translate-y-[50%]" />
                <Handle type="target" position={Position.Left} id="l-t" className="!w-3 !h-3 !border-0 !bg-white/20 hover:!bg-white !left-0 !translate-x-[-50%] !top-1/2 !translate-y-[-50%]" />
                <Handle type="source" position={Position.Left} id="l-s" className="!w-3 !h-3 !border-0 !bg-white/20 hover:!bg-white !left-0 !translate-x-[-50%] !top-1/2 !translate-y-[-50%]" />
                <Handle type="target" position={Position.Right} id="r-t" className="!w-3 !h-3 !border-0 !bg-white/20 hover:!bg-white !right-0 !translate-x-[50%] !top-1/2 !translate-y-[-50%]" />
                <Handle type="source" position={Position.Right} id="r-s" className="!w-3 !h-3 !border-0 !bg-white/20 hover:!bg-white !right-0 !translate-x-[50%] !top-1/2 !translate-y-[-50%]" />

                {isInfrastructure && (
                    <div className="absolute -top-3 left-6 px-3 py-0.5 bg-white border rounded-none text-[10px] font-bold uppercase tracking-widest text-black/40">
                        {type}: {data.label as string}
                    </div>
                )}

                {isNote ? (
                    <div className="flex-1 flex flex-col p-1">
                        <p className={`text-[13px] leading-snug font-medium whitespace-pre-wrap ${style.text}`}>
                            {(data.label as string) || ''}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={`flex ${isData ? 'flex-col items-center text-center mt-1' : 'items-center gap-3'} flex-shrink-0`}>
                            <div className={`
                                p-2 rounded-none transition-colors w-10 h-10 flex items-center justify-center
                                bg-white/10 ${style.icon}
                            `}>
                                {IconElement}
                            </div>

                            <div className="flex flex-col min-w-0">
                                <span className={`text-[12px] font-bold truncate leading-tight ${style.text}`}>
                                    {data.label as string}
                                </span>
                                <span className={`text-[9px] uppercase tracking-widest font-bold mt-0.5 opacity-60 ${style.text}`}>
                                    {provider || type}
                                </span>
                            </div>
                        </div>

                        {/* Sub-Collections Display */}
                        {isData && Array.isArray(data.collections) && data.collections.length > 0 && (
                            <div className="mt-3 w-full space-y-1 flex-grow overflow-hidden">
                                <div className="text-[8px] uppercase tracking-widest font-bold opacity-30 text-white mb-1">Collections</div>
                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[200px] pr-1 scrollbar-hide">
                                    {(data.collections as any[]).map((coll, i) => (
                                        <div key={i} className="px-2 py-1 bg-white/10 border border-white/5 text-[10px] font-medium text-white truncate flex items-center gap-1.5 shrink-0">
                                            <div className="w-1 h-1 rounded-full bg-white/40" />
                                            {String(coll)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
