import { useState } from 'react';
import type { AnyNode, ArchEdge, EdgeDirection, NodeData, GroupNodeData } from '@/types/chart';
import { NODE_TYPES_CONFIG, EDGE_TYPES_CONFIG, CATEGORY_LABELS } from '@/types/chart';
import type { NodeCategory } from '@/types/chart';
import { useCustomTypesContext } from '@/contexts/CustomTypesContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, X, ArrowRight, ArrowLeftRight, ArrowLeft, Ban, Group, Plus } from 'lucide-react';
import CustomTypesDialog from './CustomTypesDialog';

// ---------- Group properties ----------

function GroupProperties({
  node, onUpdateNode, onDeleteNode, onUngroup, onClose,
}: {
  node: AnyNode;
  onUpdateNode: (id: string, data: Record<string, unknown>) => void;
  onDeleteNode: (id: string) => void;
  onUngroup?: (groupId: string) => void;
  onClose: () => void;
}) {
  const groupData = node.data as GroupNodeData;
  return (
    <div className="absolute top-3 right-3 z-40 w-64 rounded-xl border bg-card/95 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in-0 slide-in-from-right-2 duration-150">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Group className="w-3.5 h-3.5 text-muted-foreground" />
          <h3 className="font-semibold text-xs">Group Properties</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-3">
        <Label className="text-xs">Label</Label>
        <Input
          value={groupData.label as string}
          onChange={e => onUpdateNode(node.id, { label: e.target.value })}
          className="h-8 text-sm mt-1"
        />
      </div>
      <div className="p-3 border-t space-y-2">
        <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => onUngroup?.(node.id)}>
          <Group className="h-3.5 w-3.5 mr-1.5" /> Ungroup
        </Button>
        <Button variant="destructive" size="sm" className="w-full h-8 text-xs" onClick={() => onDeleteNode(node.id)}>
          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Group
        </Button>
      </div>
    </div>
  );
}

// ---------- Node properties ----------

function NodeProperties({
  node, onUpdateNode, onDeleteNode, onClose,
}: {
  node: AnyNode;
  onUpdateNode: (id: string, data: Record<string, unknown>) => void;
  onDeleteNode: (id: string) => void;
  onClose: () => void;
}) {
  const { customNodeTypes } = useCustomTypesContext();
  const [createNodeTypeOpen, setCreateNodeTypeOpen] = useState(false);
  const nodeData = node.data as NodeData;
  const config = NODE_TYPES_CONFIG.find(c => c.type === nodeData.nodeType);
  const customConfig = !config ? customNodeTypes.find(c => c.id === nodeData.nodeType) : undefined;
  const colorStyle = config ? `hsl(var(${config.colorVar}))` : customConfig?.color ?? 'hsl(var(--primary))';

  // Group built-in types by category
  const groupedBuiltIn: Partial<Record<NodeCategory, typeof NODE_TYPES_CONFIG>> = {};
  for (const n of NODE_TYPES_CONFIG) {
    (groupedBuiltIn[n.category] ??= []).push(n);
  }

  return (
    <>
      <div className="absolute top-3 right-3 z-40 w-64 rounded-xl border bg-card/95 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in-0 slide-in-from-right-2 duration-150">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorStyle }} />
            <h3 className="font-semibold text-xs">Node Properties</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-3 space-y-3">
          <div>
            <Label className="text-xs mb-1.5 block">Type</Label>
            <Select
              value={nodeData.nodeType}
              onValueChange={(value: string) => {
                if (value === '__create_custom__') {
                  setCreateNodeTypeOpen(true);
                  return;
                }
                const builtIn = NODE_TYPES_CONFIG.find(c => c.type === value);
                const custom = !builtIn ? customNodeTypes.find(c => c.id === value) : undefined;
                const newLabel = builtIn?.label ?? custom?.label ?? value;
                onUpdateNode(node.id, { nodeType: value, label: newLabel });
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <div className="border-b mb-1 pb-1">
                  <SelectItem value="__create_custom__" className="text-xs text-primary font-medium">
                    <Plus className="h-3 w-3 mr-1 inline" /> Create Custom...
                  </SelectItem>
                </div>
                {(Object.entries(groupedBuiltIn) as [NodeCategory, typeof NODE_TYPES_CONFIG][]).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {CATEGORY_LABELS[cat]}
                    </div>
                    {items.map(opt => (
                      <SelectItem key={opt.type} value={opt.type} className="text-xs">
                        {opt.icon} {opt.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
                {customNodeTypes.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Custom
                    </div>
                    {customNodeTypes.map(opt => (
                      <SelectItem key={opt.id} value={opt.id} className="text-xs">
                        {opt.icon} {opt.label}
                      </SelectItem>
                    ))}
                  </div>
              </SelectContent>
            </Select>
          </div>
          </div>
          <div>
            <Label className="text-xs">Label</Label>
            <Input
              value={nodeData.label}
              onChange={e => onUpdateNode(node.id, { label: e.target.value })}
              className="h-8 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              value={nodeData.description}
              onChange={e => onUpdateNode(node.id, { description: e.target.value })}
              placeholder="Add a description..."
              className="text-sm mt-1 min-h-[200px] resize-y"
            />
          </div>
          <div>
            <Label className="text-xs">URL</Label>
            <Input
              value={nodeData.url || ''}
              onChange={e => onUpdateNode(node.id, { url: e.target.value })}
              placeholder="https://..."
              className="h-8 text-xs font-mono mt-1"
            />
          </div>
        </div>
        <div className="p-3 border-t">
          <Button variant="destructive" size="sm" className="w-full h-8 text-xs" onClick={() => onDeleteNode(node.id)}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Node
          </Button>
        </div>
      </div>
      <CustomTypesDialog open={createNodeTypeOpen} onOpenChange={setCreateNodeTypeOpen} defaultTab="nodes" />
    </>
  );
}

// ---------- Edge properties ----------

function EdgeProperties({
  edge, onUpdateEdge, onDeleteEdge, onClose,
}: {
  edge: ArchEdge;
  onUpdateEdge: (id: string, data: Partial<ArchEdge['data']>) => void;
  onDeleteEdge: (id: string) => void;
  onClose: () => void;
}) {
  const { customEdgeTypes } = useCustomTypesContext();
  const [createEdgeTypeOpen, setCreateEdgeTypeOpen] = useState(false);
  const currentDirection = edge.data?.direction || 'forward';

  return (
    <>
      <div className="absolute top-3 right-3 z-40 w-64 rounded-xl border bg-card/95 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in-0 slide-in-from-right-2 duration-150">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-xs">Edge Properties</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-3 space-y-3">
          <div>
            <Label className="text-xs mb-1.5 block">Protocol</Label>
            <Select
              value={edge.data?.edgeType || 'rest'}
              onValueChange={(value: string) => {
                if (value === '__create_custom__') {
                  setCreateEdgeTypeOpen(true);
                  return;
                }
                onUpdateEdge(edge.id, { edgeType: value });
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <div className="border-b mb-1 pb-1">
                  <SelectItem value="__create_custom__" className="text-xs text-primary font-medium">
                    <Plus className="h-3 w-3 mr-1 inline" /> Create Custom...
                  </SelectItem>
                </div>
                {EDGE_TYPES_CONFIG.map(opt => (
                  <SelectItem key={opt.type} value={opt.type} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
                {customEdgeTypes.length > 0 && (
                  <>
                    {customEdgeTypes.map(opt => (
                      <SelectItem key={opt.id} value={opt.id} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Direction</Label>
            <div className="grid grid-cols-4 gap-1">
              {([
                { value: 'forward' as EdgeDirection, icon: <ArrowRight className="h-3.5 w-3.5" />, label: 'Forward' },
                { value: 'reverse' as EdgeDirection, icon: <ArrowLeft className="h-3.5 w-3.5" />, label: 'Reverse' },
                { value: 'bidirectional' as EdgeDirection, icon: <ArrowLeftRight className="h-3.5 w-3.5" />, label: 'Both' },
                { value: 'none' as EdgeDirection, icon: <Ban className="h-3.5 w-3.5" />, label: 'None' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onUpdateEdge(edge.id, { direction: opt.value })}
                  title={opt.label}
                  className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] transition-colors ${
                    currentDirection === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-accent text-muted-foreground'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              value={edge.data?.description || ''}
              onChange={e => onUpdateEdge(edge.id, { description: e.target.value })}
              placeholder="Add a description..."
              className="text-sm mt-1 min-h-[80px] resize-y"
            />
          </div>
        </div>
        <div className="p-3 border-t">
          <Button variant="destructive" size="sm" className="w-full h-8 text-xs" onClick={() => onDeleteEdge(edge.id)}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Edge
          </Button>
        </div>
      </div>
      <CustomTypesDialog open={createEdgeTypeOpen} onOpenChange={setCreateEdgeTypeOpen} defaultTab="edges" />
    </>
  );
}

// ---------- Main panel ----------

interface PropertiesPanelProps {
  selectedNode?: AnyNode | null;
  selectedEdge?: ArchEdge | null;
  onUpdateNode: (id: string, data: Record<string, unknown>) => void;
  onUpdateEdge: (id: string, data: Partial<ArchEdge['data']>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onUngroup?: (groupId: string) => void;
  onClose: () => void;
}

export default function PropertiesPanel({
  selectedNode, selectedEdge,
  onUpdateNode, onUpdateEdge,
  onDeleteNode, onDeleteEdge, onUngroup, onClose,
}: PropertiesPanelProps) {
  if (!selectedNode && !selectedEdge) return null;

  if (selectedNode) {
    if (selectedNode.type === 'group') {
      return <GroupProperties node={selectedNode} onUpdateNode={onUpdateNode} onDeleteNode={onDeleteNode} onUngroup={onUngroup} onClose={onClose} />;
    }
    return <NodeProperties node={selectedNode} onUpdateNode={onUpdateNode} onDeleteNode={onDeleteNode} onClose={onClose} />;
  }

  if (selectedEdge) {
    return <EdgeProperties edge={selectedEdge} onUpdateEdge={onUpdateEdge} onDeleteEdge={onDeleteEdge} onClose={onClose} />;
  }

  return null;
}
