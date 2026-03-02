import { useState } from 'react';
import type { AnyNode, ArchEdge, NodeData } from '@/types/chart';
import { NODE_TYPES_CONFIG, EDGE_TYPES_CONFIG } from '@/types/chart';
import { useCustomTypesContext } from '@/contexts/CustomTypesContext';
import { ChevronLeft, Layers, ArrowRight, Trash2, Group } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayersPanelProps {
  nodes: AnyNode[];
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
  const { customNodeTypes, customEdgeTypes } = useCustomTypesContext();
  const [collapsed, setCollapsed] = useState(false);

  const groupNodes = nodes.filter(n => n.type === 'group');
  const ungroupedNodes = nodes.filter(n => n.type !== 'group' && !n.parentId);
  const childNodes = nodes.filter(n => n.type !== 'group' && n.parentId != null);

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
              {/* Group nodes with their children */}
              {groupNodes.map(group => {
                const groupChildren = childNodes.filter(n => n.parentId === group.id);
                return (
                  <div key={group.id}>
                    <div
                      onClick={() => onSelectNode(group.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer group transition-colors ${
                        selectedNodeId === group.id
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Group className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate flex-1">{group.data.label as string}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteNode(group.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                    {groupChildren.map(child => {
                      const config = NODE_TYPES_CONFIG.find(c => c.type === (child.data as NodeData).nodeType);
                      const customCfg = !config ? customNodeTypes.find(c => c.id === (child.data as NodeData).nodeType) : undefined;
                      return (
                        <div
                          key={child.id}
                          onClick={() => onSelectNode(child.id)}
                          className={`flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-lg text-xs cursor-pointer group transition-colors ${
                            selectedNodeId === child.id
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: config ? `hsl(var(${config.colorVar}))` : customCfg?.color ?? undefined }}
                          />
                          <span className="truncate flex-1">{(child.data as NodeData).label}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{config?.label ?? customCfg?.label}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteNode(child.id); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {/* Ungrouped nodes */}
              {ungroupedNodes.map(node => {
                const config = NODE_TYPES_CONFIG.find(c => c.type === (node.data as NodeData).nodeType);
                const customCfg = !config ? customNodeTypes.find(c => c.id === (node.data as NodeData).nodeType) : undefined;
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
                      style={{ backgroundColor: config ? `hsl(var(${config.colorVar}))` : customCfg?.color ?? undefined }}
                    />
                    <span className="truncate flex-1">{(node.data as NodeData).label}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{config?.label ?? customCfg?.label}</span>
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
                const customEdgeCfg = !edgeConfig ? customEdgeTypes.find(c => c.id === edge.data?.edgeType) : undefined;
                const sourceLabel = sourceNode ? (sourceNode.data.label as string) : '?';
                const targetLabel = targetNode ? (targetNode.data.label as string) : '?';
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
                    <span className="truncate max-w-[70px]">{sourceLabel}</span>
                    <ArrowRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate max-w-[70px]">{targetLabel}</span>
                    <span className="text-[10px] text-muted-foreground font-mono ml-auto">{edgeConfig?.label ?? customEdgeCfg?.label}</span>
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
