import { memo } from 'react';
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { ArchEdge } from '@/types/chart';

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
  const {
    id, sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition, data, selected, style,
  } = props;

  const direction = data?.direction || 'forward';
  const edgeType = data?.edgeType || 'rest';
  const strokeColor = selected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))';
  const isDisabled = direction === 'none';

  const isReverse = direction === 'reverse';
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: isReverse ? targetX : sourceX,
    sourceY: isReverse ? targetY : sourceY,
    targetX: isReverse ? sourceX : targetX,
    targetY: isReverse ? sourceY : targetY,
    sourcePosition: isReverse ? targetPosition : sourcePosition,
    targetPosition: isReverse ? sourcePosition : targetPosition,
    borderRadius: 16,
  });

  const label = data?.description
    ? `${EDGE_LABELS[edgeType]}: ${data.description}`
    : EDGE_LABELS[edgeType];

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
            orient="auto-start-reverse"
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
          strokeDasharray: EDGE_STYLES[edgeType],
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
          className={`absolute text-[10px] font-mono px-2 py-0.5 rounded-md border pointer-events-auto cursor-pointer transition-colors ${
            isDisabled ? 'opacity-40' : ''
          } ${
            selected
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border'
          }`}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
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
