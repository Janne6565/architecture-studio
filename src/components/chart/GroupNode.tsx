import { memo } from 'react';
import { NodeResizer, type NodeProps } from '@xyflow/react';
import type { GroupNode } from '@/types/chart';

function GroupNodeComponent({ data, selected }: NodeProps<GroupNode>) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <NodeResizer
        isVisible={!!selected}
        minWidth={200}
        minHeight={120}
        lineStyle={{ borderColor: 'hsl(var(--primary) / 0.4)', borderWidth: 1 }}
        handleStyle={{
          width: 8,
          height: 8,
          borderColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--background))',
          borderRadius: 2,
        }}
      />
      <div
        className="w-full h-full rounded-xl border-2 border-dashed"
        style={{
          background: 'hsl(var(--primary) / 0.04)',
          borderColor: selected ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--border))',
        }}
      >
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground select-none">
          {data.label || 'Group'}
        </div>
      </div>
    </div>
  );
}

export default memo(GroupNodeComponent);
