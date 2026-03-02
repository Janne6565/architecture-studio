import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
  SelectionMode,
} from '@xyflow/react';
import type { ArchNode, ArchEdge, NodeType, EdgeType } from '@/types/chart';
import { NODE_TYPES_CONFIG } from '@/types/chart';
import { useChartStorage } from '@/hooks/useChartStorage';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import ArchitectureNode from '@/components/chart/ArchitectureNode';
import ArchitectureEdge from '@/components/chart/ArchitectureEdge';
import FloatingToolbar from '@/components/chart/FloatingToolbar';
import LayersPanel from '@/components/chart/LayersPanel';
import PropertiesPanel from '@/components/chart/PropertiesPanel';
import EditorToolbar from '@/components/chart/EditorToolbar';
import SelectionActions from '@/components/chart/SelectionActions';
import CanvasContextMenu from '@/components/chart/CanvasContextMenu';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const nodeTypes: NodeTypes = { architecture: ArchitectureNode };
const edgeTypes: EdgeTypes = { architecture: ArchitectureEdge };

function ChartEditorInner() {
  const { chartId } = useParams<{ chartId: string }>();
  const navigate = useNavigate();
  const { getChart, updateChart } = useChartStorage();
  const [edgeType, setEdgeType] = useState<EdgeType>('rest');
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [shiftHeld, setShiftHeld] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Track Shift key for drag-select
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === 'Shift') setShiftHeld(true); };
    const up = (e: KeyboardEvent) => { if (e.key === 'Shift') setShiftHeld(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const chart = useMemo(() => getChart(chartId || ''), [chartId, getChart]);

  const [nodes, setNodes, onNodesChange] = useNodesState<ArchNode>(chart?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ArchEdge>(chart?.edges || []);
  const nodesRef = useRef<ArchNode[]>(chart?.nodes || []);
  const edgesRef = useRef<ArchEdge[]>(chart?.edges || []);

  const {
    state: historyState, set: pushHistory,
    undo, redo, canUndo, canRedo, reset: resetHistory,
  } = useUndoRedo({ nodes: chart?.nodes || [], edges: chart?.edges || [] });

  const undoRedoRef = useRef(false);

  const handleUndo = useCallback(() => {
    undoRedoRef.current = true;
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    undoRedoRef.current = true;
    redo();
  }, [redo]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => edges.find(e => e.id === selectedEdgeId) || null, [edges, selectedEdgeId]);
  const selectedNodes = useMemo(() => nodes.filter(n => n.selected), [nodes]);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  // Auto-save
  useEffect(() => {
    if (!chartId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateChart(chartId, { nodes, edges });
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [nodes, edges, chartId, updateChart]);

  // Undo/redo keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        
        // Multi-select delete: check for selected nodes in React Flow
        const rfSelectedIds = nodesRef.current.filter(n => n.selected).map(n => n.id);
        if (rfSelectedIds.length > 0) {
          deleteNodesByIds(rfSelectedIds);
          return;
        }
        if (selectedNodeId) {
          deleteNodesByIds([selectedNodeId]);
          return;
        }
        if (selectedEdgeId) {
          const nextEdges = edgesRef.current.filter(e => e.id !== selectedEdgeId);
          setEdges(nextEdges);
          setSelectedEdgeId(null);
          pushHistory({ nodes: nodesRef.current, edges: nextEdges });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo, selectedNodeId, selectedEdgeId, setNodes, setEdges, pushHistory]);

  // Sync undo/redo state — only apply when triggered by undo/redo
  useEffect(() => {
    if (!undoRedoRef.current) return;
    undoRedoRef.current = false;
    setNodes(historyState.nodes);
    setEdges(historyState.edges);
  }, [historyState, setNodes, setEdges]);

  const pushCurrentState = useCallback((nextNodes?: ArchNode[], nextEdges?: ArchEdge[]) => {
    pushHistory({
      nodes: nextNodes ?? nodesRef.current,
      edges: nextEdges ?? edgesRef.current,
    });
  }, [pushHistory]);

  const onConnect = useCallback((connection: Connection) => {
    const newEdge: ArchEdge = {
      ...connection,
      id: `e-${Date.now()}`,
      type: 'architecture',
      data: { edgeType, description: '', direction: 'forward' },
    } as ArchEdge;

    setEdges(es => {
      const updated = addEdge(newEdge, es) as ArchEdge[];
      setTimeout(() => pushCurrentState(undefined, updated), 0);
      return updated;
    });
  }, [edgeType, setEdges, pushCurrentState]);

  const onNodesChangeWrapped = useCallback((changes: Parameters<typeof onNodesChange>[0]) => {
    onNodesChange(changes);
    const significant = changes.some(c => c.type === 'position' && c.dragging === false);
    if (significant) setTimeout(() => pushCurrentState(), 0);
  }, [onNodesChange, pushCurrentState]);

  const onAddNode = useCallback((type: NodeType) => {
    const config = NODE_TYPES_CONFIG.find(c => c.type === type)!;
    const newNode: ArchNode = {
      id: `node-${Date.now()}`,
      type: 'architecture',
      position: { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 },
      data: {
        label: config.label,
        description: '',
        nodeType: type,
      },
    };

    setNodes(ns => {
      const updated = [...ns, newNode];
      setTimeout(() => pushCurrentState(updated, undefined), 0);
      return updated;
    });
  }, [setNodes, pushCurrentState]);

  const onUpdateNode = useCallback((id: string, data: Partial<ArchNode['data']>) => {
    setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n));
  }, [setNodes]);

  const onUpdateEdge = useCallback((id: string, data: Partial<ArchEdge['data']>) => {
    setEdges(es => es.map(e => e.id === id ? { ...e, data: { ...e.data!, ...data } } : e));
  }, [setEdges]);

  const deleteNodesByIds = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    const nextNodes = nodesRef.current.filter(n => !idSet.has(n.id));
    const nextEdges = edgesRef.current.filter(e => !idSet.has(e.source) && !idSet.has(e.target));
    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    pushCurrentState(nextNodes, nextEdges);
  }, [setNodes, setEdges, pushCurrentState]);

  const onDeleteNode = useCallback((id: string) => {
    deleteNodesByIds([id]);
  }, [deleteNodesByIds]);

  const onDeleteEdge = useCallback((id: string) => {
    const nextEdges = edgesRef.current.filter(e => e.id !== id);
    setEdges(nextEdges);
    setSelectedEdgeId(null);
    pushCurrentState(undefined, nextEdges);
  }, [setEdges, pushCurrentState]);

  const onClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    pushHistory({ nodes: [], edges: [] });
  }, [setNodes, setEdges, pushHistory]);

  const onExportJson = useCallback(() => {
    return JSON.stringify({ nodes, edges }, null, 2);
  }, [nodes, edges]);

  const onImportJson = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
        pushHistory({ nodes: data.nodes, edges: data.edges });
        toast.success('Diagram imported');
      }
    } catch {
      toast.error('Invalid JSON file');
    }
  }, [setNodes, setEdges, pushHistory]);

  const toggleDarkMode = useCallback(() => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(d => !d);
  }, []);

  if (!chart) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chart not found</h2>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none border-b border-r"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <EditorToolbar
            chartName={chart.name}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={onClear}
            onImportJson={onImportJson}
            onExportJson={onExportJson}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <LayersPanel
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onSelectNode={(id) => { setSelectedNodeId(id); setSelectedEdgeId(null); }}
            onSelectEdge={(id) => { setSelectedEdgeId(id); setSelectedNodeId(null); }}
            onDeleteNode={onDeleteNode}
            onDeleteEdge={onDeleteEdge}
          />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeWrapped}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={(e, node) => {
              if (e.shiftKey) {
                // Toggle selection on shift+click
                setNodes(ns => ns.map(n => n.id === node.id ? { ...n, selected: !n.selected } : n));
              } else {
                setSelectedNodeId(node.id);
                setSelectedEdgeId(null);
                setNodes(ns => ns.map(n => ({ ...n, selected: n.id === node.id })));
              }
            }}
            onEdgeClick={(_, edge) => { setSelectedEdgeId(edge.id); setSelectedNodeId(null); }}
            onPaneClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
            fitView
            defaultEdgeOptions={{ type: 'architecture' }}
            snapToGrid
            snapGrid={[16, 16]}
            selectionOnDrag={shiftHeld}
            selectionMode={SelectionMode.Partial}
            panOnDrag={!shiftHeld}
            panOnScroll
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                const config = NODE_TYPES_CONFIG.find(c => c.type === (n.data as ArchNode['data'])?.nodeType);
                return config ? `hsl(var(${config.colorVar}))` : 'hsl(var(--muted))';
              }}
              zoomable
              pannable
            />
          </ReactFlow>

          <FloatingToolbar
            onAddNode={onAddNode}
            selectedEdgeType={edgeType}
            onEdgeTypeChange={setEdgeType}
          />

          <SelectionActions
            selectedNodes={selectedNodes}
            onDeleteSelected={() => deleteNodesByIds(selectedNodes.map(n => n.id))}
            onClearSelection={() => {
              setNodes(ns => ns.map(n => ({ ...n, selected: false })));
              setSelectedNodeId(null);
            }}
          />

          <PropertiesPanel
            selectedNode={selectedNodes.length <= 1 ? selectedNode : null}
            selectedEdge={selectedEdge}
            onUpdateNode={onUpdateNode}
            onUpdateEdge={onUpdateEdge}
            onDeleteNode={onDeleteNode}
            onDeleteEdge={onDeleteEdge}
            onClose={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
          />

          <CanvasContextMenu
            nodes={nodes}
            onDeleteNodes={deleteNodesByIds}
            onSelectNode={(id) => { setSelectedNodeId(id); setSelectedEdgeId(null); }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChartEditor() {
  return (
    <ReactFlowProvider>
      <ChartEditorInner />
    </ReactFlowProvider>
  );
}
