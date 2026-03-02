import { memo, useRef, useCallback, useEffect, useState } from 'react';
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useEdges,
  useReactFlow,
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
  const { setEdges } = useReactFlow();
  const {
    id, source, target, sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition, data, selected, style,
  } = props;

  const pathRef = useRef<SVGPathElement>(null);
  const dragging = useRef(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const direction = data?.direction || 'forward';
  const edgeType = data?.edgeType || 'rest';
  const labelPosition = data?.labelPosition ?? 0.5;
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

  const [edgePath, defaultLabelX, defaultLabelY] = getSmoothStepPath({
    sourceX: isReverse ? offTX : offSX,
    sourceY: isReverse ? offTY : offSY,
    targetX: isReverse ? offSX : offTX,
    targetY: isReverse ? offSY : offTY,
    sourcePosition: isReverse ? targetPosition : sourcePosition,
    targetPosition: isReverse ? sourcePosition : targetPosition,
    borderRadius: 16,
  });

  // Compute label position along the SVG path
  const getPointAtRatio = useCallback((ratio: number): { x: number; y: number } => {
    const path = pathRef.current;
    if (!path) return { x: defaultLabelX, y: defaultLabelY };
    const totalLen = path.getTotalLength();
    const pt = path.getPointAtLength(ratio * totalLen);
    return { x: pt.x, y: pt.y };
  }, [defaultLabelX, defaultLabelY]);

  const labelPoint = dragPos ?? getPointAtRatio(labelPosition);

  // Find the closest ratio (0–1) on the path to a given SVG point
  const closestRatioOnPath = useCallback((px: number, py: number): number => {
    const path = pathRef.current;
    if (!path) return 0.5;
    const totalLen = path.getTotalLength();
    // Binary-style search: sample then refine
    const SAMPLES = 50;
    let bestDist = Infinity;
    let bestLen = totalLen * 0.5;
    for (let i = 0; i <= SAMPLES; i++) {
      const len = (i / SAMPLES) * totalLen;
      const pt = path.getPointAtLength(len);
      const d = (pt.x - px) ** 2 + (pt.y - py) ** 2;
      if (d < bestDist) { bestDist = d; bestLen = len; }
    }
    // Refine within the nearest segment
    const step = totalLen / SAMPLES;
    const lo = Math.max(0, bestLen - step);
    const hi = Math.min(totalLen, bestLen + step);
    for (let i = 0; i <= 20; i++) {
      const len = lo + (i / 20) * (hi - lo);
      const pt = path.getPointAtLength(len);
      const d = (pt.x - px) ** 2 + (pt.y - py) ** 2;
      if (d < bestDist) { bestDist = d; bestLen = len; }
    }
    return Math.max(0, Math.min(1, bestLen / totalLen));
  }, []);

  // Drag handlers
  const onLabelPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onLabelPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    // Convert screen coords to the SVG flow coordinate system
    const svg = pathRef.current?.closest('svg');
    if (!svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgPt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const ratio = closestRatioOnPath(svgPt.x, svgPt.y);
    const path = pathRef.current!;
    const pt = path.getPointAtLength(ratio * path.getTotalLength());
    setDragPos({ x: pt.x, y: pt.y });
  }, [closestRatioOnPath]);

  const onLabelPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    // Compute final ratio and persist
    const svg = pathRef.current?.closest('svg');
    if (!svg) { setDragPos(null); return; }
    const ctm = svg.getScreenCTM();
    if (!ctm) { setDragPos(null); return; }
    const svgPt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const ratio = closestRatioOnPath(svgPt.x, svgPt.y);
    setDragPos(null);
    setEdges(es => es.map(edge =>
      edge.id === id ? { ...edge, data: { ...edge.data!, labelPosition: ratio } } : edge
    ));
  }, [id, closestRatioOnPath, setEdges]);

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
        ref={pathRef}
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
          onPointerDown={onLabelPointerDown}
          onPointerMove={onLabelPointerMove}
          onPointerUp={onLabelPointerUp}
          className={`absolute text-[10px] w-20 text-center font-mono px-2 py-0.5 rounded-md border pointer-events-auto select-none transition-colors ${
            dragging.current ? 'cursor-grabbing' : 'cursor-grab'
          } ${
            isDisabled ? 'opacity-40' : ''
          } ${
            selected
              ? 'bg-primary text-primary-foreground border-primary shadow-md'
              : 'bg-background text-foreground border-border shadow-sm'
          }`}
          style={{
            transform: `translate(-50%, -50%) translate(${labelPoint.x}px, ${labelPoint.y}px)`,
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
