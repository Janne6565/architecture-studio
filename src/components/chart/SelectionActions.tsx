import type { AnyNode, NodeData } from '@/types/chart';
import { NODE_TYPES_CONFIG } from '@/types/chart';
import { Trash2, X, Group } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectionActionsProps {
  selectedNodes: AnyNode[];
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  onGroupNodes: (ids: string[]) => void;
}

export default function SelectionActions({
  selectedNodes,
  onDeleteSelected,
  onClearSelection,
  onGroupNodes,
}: SelectionActionsProps) {
  if (selectedNodes.length < 2) return null;

  const nonGroupNodes = selectedNodes.filter(n => n.type !== 'group');
  const canGroup = nonGroupNodes.length >= 2;

  return (
    <div className="absolute top-3 right-3 z-40 rounded-xl border bg-card/95 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in-0 slide-in-from-right-2 duration-150">
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <span className="text-xs font-semibold">{selectedNodes.length} selected</span>
        <button onClick={onClearSelection} className="text-muted-foreground hover:text-foreground ml-1">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-2 space-y-1 max-h-40 overflow-y-auto">
        {selectedNodes.map(node => {
          const isGroup = node.type === 'group';
          const config = isGroup
            ? null
            : NODE_TYPES_CONFIG.find(c => c.type === (node.data as NodeData).nodeType);
          return (
            <div key={node.id} className="flex items-center gap-2 px-2 py-1 text-xs">
              {isGroup ? (
                <Group className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
              ) : (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config ? `hsl(var(${config.colorVar}))` : undefined }}
                />
              )}
              <span className="truncate max-w-[140px]">{node.data.label as string}</span>
            </div>
          );
        })}
      </div>
      <div className="p-2 border-t space-y-1.5">
        {canGroup && (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() => onGroupNodes(nonGroupNodes.map(n => n.id))}
          >
            <Group className="h-3.5 w-3.5 mr-1.5" />
            Group {nonGroupNodes.length} nodes
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={onDeleteSelected}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Delete {selectedNodes.length} nodes
        </Button>
      </div>
    </div>
  );
}
