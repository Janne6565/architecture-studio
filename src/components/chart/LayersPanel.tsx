import { useState } from 'react';
import type { ArchNode, ArchEdge } from '@/types/chart';
import { NODE_TYPES_CONFIG, EDGE_TYPES_CONFIG } from '@/types/chart';
import { ChevronLeft, ChevronRight, Layers, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayersPanelProps {
  nodes: ArchNode[];
  edges: ArchEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (id: string) => void;
  onSelectEdge: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
}

export default function LayersPanel({
  nodes, edges,
  selectedNodeId, selectedEdgeId,
  onSelectNode, onSelectEdge,
  onDeleteNode, onDeleteEdge,
}: LayersPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="absolute top-3 left-3 z-40">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl bg-card/95 backdrop-blur-md shadow-lg border"
          onClick={() => setCollapsed(false)}
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute top-3 left-3 z-40 w-60 rounded-xl border bg-card/95 backdrop-blur-md shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold">Layers</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground font-mono">
            {nodes.length}N · {edges.length}E
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="max-h-[50vh] overflow-y-auto">
        {/* Nodes */}
        {nodes.length > 0 && (
          <div className="p-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1 px-1">
              Nodes
            </div>
            <div className="space-y-0.5">
              {nodes.map(node => {
                const config = NODE_TYPES_CONFIG.find(c => c.type === node.data.nodeType);
                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectNode(node.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer group transition-colors ${
                      selectedNodeId === node.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: config ? `hsl(var(${config.colorVar}))` : undefined }}
                    />
                    <span className="truncate flex-1">{node.data.label}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{config?.label}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Edges */}
        {edges.length > 0 && (
          <div className="p-2 border-t">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1 px-1">
              Connections
            </div>
            <div className="space-y-0.5">
              {edges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                const edgeConfig = EDGE_TYPES_CONFIG.find(c => c.type === edge.data?.edgeType);
                return (
                  <div
                    key={edge.id}
                    onClick={() => onSelectEdge(edge.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer group transition-colors ${
                      selectedEdgeId === edge.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="truncate max-w-[70px]">{sourceNode?.data.label || '?'}</span>
                    <ArrowRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate max-w-[70px]">{targetNode?.data.label || '?'}</span>
                    <span className="text-[10px] text-muted-foreground font-mono ml-auto">{edgeConfig?.label}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteEdge(edge.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {nodes.length === 0 && edges.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Use the toolbar below to add components
          </div>
        )}
      </div>
    </div>
  );
}
