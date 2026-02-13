import { Handle, Position, NodeProps } from '@xyflow/react';
import {
    Server,
    Database,
    Cpu,
    Globe,
    MessageSquare,
    HardDrive,
    Zap,
    Box
} from 'lucide-react';

const icons: Record<string, any> = {
    server: Server,
    database: Database,
    loadBalancer: Cpu,
    gateway: Globe,
    queue: MessageSquare,
    storage: HardDrive,
    logic: Zap,
};

export function SystemNode({ data, selected, type }: NodeProps) {
    const Icon = icons[type as string] || Box;

    return (
        <div className={`
      group relative min-w-[160px] p-3 rounded-lg bg-[#1A1A1A] border-2 transition-all duration-200
      ${selected ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-[#333] hover:border-[#444]'}
    `}>
            {/* Top and Bottom Handles */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-2 !h-2 !bg-white/20 !border-0 hover:!bg-white active:!bg-white"
            />

            <div className="flex items-center gap-3">
                <div className={`
          p-2 rounded-md bg-white/5 transition-colors
          ${selected ? 'text-white' : 'text-white/40 group-hover:text-white/60'}
        `}>
                    <Icon size={18} strokeWidth={selected ? 2.5 : 2} />
                </div>

                <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-bold text-white/90 truncate leading-tight">
                        {data.label as string}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold mt-0.5">
                        {type}
                    </span>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-2 !h-2 !bg-white/20 !border-0 hover:!bg-white active:!bg-white"
            />

            {/* Left and Right Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-2 !h-2 !bg-white/20 !border-0 hover:!bg-white"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!w-2 !h-2 !bg-white/20 !border-0 hover:!bg-white"
            />
        </div>
    );
}
