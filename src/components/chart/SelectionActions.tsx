import { useMemo } from 'react';
import type { ArchNode } from '@/types/chart';
import { NODE_TYPES_CONFIG } from '@/types/chart';
import { Trash2, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectionActionsProps {
  selectedNodes: ArchNode[];
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export default function SelectionActions({
  selectedNodes,
  onDeleteSelected,
  onClearSelection,
}: SelectionActionsProps) {
  if (selectedNodes.length < 2) return null;

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
          const config = NODE_TYPES_CONFIG.find(c => c.type === node.data.nodeType);
          return (
            <div key={node.id} className="flex items-center gap-2 px-2 py-1 text-xs">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: config ? `hsl(var(${config.colorVar}))` : undefined }}
              />
              <span className="truncate max-w-[140px]">{node.data.label}</span>
            </div>
          );
        })}
      </div>
      <div className="p-2 border-t">
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
