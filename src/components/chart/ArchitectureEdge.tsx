import { memo } from 'react';
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useEdges,
  type EdgeProps,
} from '@xyflow/react';
import type { ArchEdge } from '@/types/chart';
import { useCustomTypesContext } from '@/contexts/CustomTypesContext';

const EDGE_STYLES: Record<string, string> = {
  rest: '0',
  websocket: '8 4',
  webhook: '3 3',
  grpc: '12 3 3 3',
  graphql: '6 6',
  mqtt: '2 4',
  amqp: '10 4 2 4',
};

const EDGE_LABELS: Record<string, string> = {
  rest: 'REST',
  websocket: 'WS',
  webhook: 'Webhook',
  grpc: 'gRPC',
  graphql: 'GraphQL',
  mqtt: 'MQTT',
  amqp: 'AMQP',
};

function ArchitectureEdge(props: EdgeProps<ArchEdge>) {
  const { customEdgeTypes } = useCustomTypesContext();
  const {
    id, source, target, sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition, data, selected, style,
  } = props;

  const direction = data?.direction || 'forward';
  const edgeType = data?.edgeType || 'rest';
  const strokeColor = selected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))';
  const isDisabled = direction === 'none';
  const isReverse = direction === 'reverse';

  // Compute perpendicular offset for parallel edges between the same node pair
  const allEdges = useEdges();
  const pairKey = [source, target].sort().join('|||');
  const parallelEdges = allEdges.filter(e => [e.source, e.target].sort().join('|||') === pairKey);
  const edgeIndex = parallelEdges.findIndex(e => e.id === id);
  const totalEdges = parallelEdges.length;

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;
  const OFFSET_STEP = 28;
  const offsetAmount = totalEdges > 1 ? (edgeIndex - (totalEdges - 1) / 2) * OFFSET_STEP : 0;

  const offSX = sourceX + perpX * offsetAmount;
  const offSY = sourceY + perpY * offsetAmount;
  const offTX = targetX + perpX * offsetAmount;
  const offTY = targetY + perpY * offsetAmount;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: isReverse ? offTX : offSX,
    sourceY: isReverse ? offTY : offSY,
    targetX: isReverse ? offSX : offTX,
    targetY: isReverse ? offSY : offTY,
    sourcePosition: isReverse ? targetPosition : sourcePosition,
    targetPosition: isReverse ? sourcePosition : targetPosition,
    borderRadius: 16,
  });

  const label = data?.description
    ? `${EDGE_LABELS[edgeType] ?? customEdgeTypes.find(c => c.id === edgeType)?.label ?? edgeType}: ${data.description}`
    : EDGE_LABELS[edgeType] ?? customEdgeTypes.find(c => c.id === edgeType)?.label ?? edgeType;

  const markerId = `arrow-${id}`;
  const markerStartId = `arrow-start-${id}`;
  const showEnd = direction === 'forward' || direction === 'reverse' || direction === 'bidirectional';
  const showStart = direction === 'bidirectional';

  return (
    <>
      <defs>
        {showEnd && (
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
          </marker>
        )}
        {showStart && (
          <marker
            id={markerStartId}
            viewBox="0 0 10 10"
            refX="2"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M 10 0 L 0 5 L 10 10 z" fill={strokeColor} />
          </marker>
        )}
      </defs>
      <path
        id={id}
        d={edgePath}
        fill="none"
        className="react-flow__edge-path"
        style={{
          ...style,
          strokeDasharray: EDGE_STYLES[edgeType] ?? (() => {
            const cp = customEdgeTypes.find(c => c.id === edgeType)?.dashPattern;
            if (cp === 'dashed') return '8 4';
            if (cp === 'dotted') return '3 3';
            return '0';
          })(),
          stroke: strokeColor,
          strokeWidth: selected ? 2.5 : 1.5,
          opacity: isDisabled ? 0.3 : 1,
        }}
        markerEnd={showEnd ? `url(#${markerId})` : undefined}
        markerStart={showStart ? `url(#${markerStartId})` : undefined}
      />
      {/* Invisible wider path for easier click target */}
      <path
        d={edgePath}
        fill="none"
        style={{ stroke: 'transparent', strokeWidth: 20 }}
        className="react-flow__edge-interaction"
      />
      <EdgeLabelRenderer>
        <div
          className={`absolute text-[10px] w-20 text-center font-mono px-2 py-0.5 rounded-md border pointer-events-auto cursor-pointer transition-colors ${
            isDisabled ? 'opacity-40' : ''
          } ${
            selected
              ? 'bg-primary text-primary-foreground border-primary shadow-md'
              : 'bg-background text-foreground border-border shadow-sm'
          }`}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            zIndex: 1000,
          }}
        >
          {direction === 'bidirectional' && '⇄ '}
          {isDisabled && '⊘ '}
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ArchitectureEdge);
