import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { ArchEdge } from '@/types/chart';

const EDGE_STYLES: Record<string, string> = {
  rest: '0',
  websocket: '8 4',
  webhook: '3 3',
};

const EDGE_LABELS: Record<string, string> = {
  rest: 'REST',
  websocket: 'WS',
  webhook: 'Webhook',
};

function ArchitectureEdge(props: EdgeProps<ArchEdge>) {
  const {
    id, sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition, data, selected, style,
  } = props;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    borderRadius: 16,
  });

  const edgeType = data?.edgeType || 'rest';
  const label = data?.description
    ? `${EDGE_LABELS[edgeType]}: ${data.description}`
    : EDGE_LABELS[edgeType];

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeDasharray: EDGE_STYLES[edgeType],
          stroke: selected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
          strokeWidth: selected ? 2.5 : 1.5,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className={`absolute text-[10px] font-mono px-2 py-0.5 rounded-md border pointer-events-auto cursor-pointer transition-colors ${
            selected
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border'
          }`}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ArchitectureEdge);
