import type { ArchNode, ArchEdge, EdgeDirection } from '@/types/chart';
import { NODE_TYPES_CONFIG, EDGE_TYPES_CONFIG } from '@/types/chart';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, X, ArrowRight, ArrowLeftRight, ArrowLeft, Ban } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode?: ArchNode | null;
  selectedEdge?: ArchEdge | null;
  onUpdateNode: (id: string, data: Partial<ArchNode['data']>) => void;
  onUpdateEdge: (id: string, data: Partial<ArchEdge['data']>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onClose: () => void;
}

export default function PropertiesPanel({
  selectedNode, selectedEdge,
  onUpdateNode, onUpdateEdge,
  onDeleteNode, onDeleteEdge, onClose,
}: PropertiesPanelProps) {
  if (!selectedNode && !selectedEdge) return null;

  if (selectedNode) {
    const config = NODE_TYPES_CONFIG.find(c => c.type === selectedNode.data.nodeType);
    return (
      <div className="absolute top-3 right-3 z-40 w-64 rounded-xl border bg-card/95 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in-0 slide-in-from-right-2 duration-150">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: `hsl(var(${config?.colorVar}))` }}
            />
            <h3 className="font-semibold text-xs">Node Properties</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-3 space-y-3">
          <div className="text-[10px] font-mono text-muted-foreground">
            {config?.icon} {config?.label}
          </div>
          <div>
            <Label className="text-xs">Label</Label>
            <Input
              value={selectedNode.data.label}
              onChange={e => onUpdateNode(selectedNode.id, { label: e.target.value })}
              className="h-8 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              value={selectedNode.data.description}
              onChange={e => onUpdateNode(selectedNode.id, { description: e.target.value })}
              placeholder="Add a description..."
              className="text-sm mt-1 min-h-[80px] resize-y"
            />
          </div>
        </div>
        <div className="p-3 border-t">
          <Button
            variant="destructive"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() => onDeleteNode(selectedNode.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Node
          </Button>
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    const edgeConfig = EDGE_TYPES_CONFIG.find(c => c.type === selectedEdge.data?.edgeType);
    const currentDirection = selectedEdge.data?.direction || 'forward';
    return (
      <div className="absolute top-3 right-3 z-40 w-64 rounded-xl border bg-card/95 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in-0 slide-in-from-right-2 duration-150">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-xs">Edge Properties</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-3 space-y-3">
          <div className="text-[10px] font-mono text-muted-foreground">
            Type: {edgeConfig?.label}
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
                  onClick={() => onUpdateEdge(selectedEdge.id, { direction: opt.value })}
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
              value={selectedEdge.data?.description || ''}
              onChange={e => onUpdateEdge(selectedEdge.id, { description: e.target.value })}
              placeholder="Add a description..."
              className="text-sm mt-1 min-h-[80px] resize-y"
            />
          </div>
        </div>
        <div className="p-3 border-t">
          <Button
            variant="destructive"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() => onDeleteEdge(selectedEdge.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Edge
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
