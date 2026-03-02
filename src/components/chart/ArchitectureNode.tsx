import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ArchNode } from '@/types/chart';
import { NODE_TYPES_CONFIG } from '@/types/chart';
import { useCustomTypesContext } from '@/contexts/CustomTypesContext';

function ArchitectureNode({ data, selected }: NodeProps<ArchNode>) {
  const { customNodeTypes } = useCustomTypesContext();
  const config = NODE_TYPES_CONFIG.find(c => c.type === data.nodeType);
  const customConfig = !config ? customNodeTypes.find(c => c.id === data.nodeType) : undefined;
  const colorStyle = config ? `hsl(var(${config.colorVar}))` : customConfig?.color ?? 'hsl(var(--primary))';
  const icon = config?.icon ?? customConfig?.icon;
  const typeLabel = config?.label ?? customConfig?.label;

  return (
    <div
      className={`architecture-node w-56 rounded-lg border bg-card shadow-md transition-shadow ${
        selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-lg'
      }`}
      style={{ borderLeftWidth: '4px', borderLeftColor: colorStyle }}
    >
      <Handle type="target" position={Position.Top} id="top" className="!-top-1" />
      <Handle type="target" position={Position.Left} id="left" className="!-left-1" />

      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{icon}</span>
          {typeLabel && (
            <span
              className="text-[10px] font-mono font-medium uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: config ? `hsl(var(${config.colorVar}) / 0.15)` : customConfig ? `${customConfig.color}26` : undefined,
                color: colorStyle,
              }}
            >
              {typeLabel}
            </span>
          )}
        </div>
        <div className="font-medium text-sm text-card-foreground truncate">{data.label}</div>
        {data.description && (
          <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
        )}
        {data.url && (
          <div className="text-[10px] font-mono text-muted-foreground/70 mt-1" title={data.url}>
            🔗 {data.url.replace(/^https?:\/\//, '')}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" className="!-bottom-1" />
      <Handle type="source" position={Position.Right} id="right" className="!-right-1" />
    </div>
  );
}

export default memo(ArchitectureNode);
