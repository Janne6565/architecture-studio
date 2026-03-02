import { useCallback, useEffect, useState } from 'react';
import type { ArchNode, ArchEdge } from '@/types/chart';
import { NODE_TYPES_CONFIG } from '@/types/chart';
import { Trash2, Pencil } from 'lucide-react';

interface ContextMenuProps {
  nodes: ArchNode[];
  onDeleteNodes: (ids: string[]) => void;
  onSelectNode: (id: string) => void;
}

interface MenuState {
  x: number;
  y: number;
  nodeId: string | null;
  selectedIds: string[];
}

export default function CanvasContextMenu({ nodes, onDeleteNodes, onSelectNode }: ContextMenuProps) {
  const [menu, setMenu] = useState<MenuState | null>(null);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    // Only handle right-click on nodes or the canvas
    const target = e.target as HTMLElement;
    const nodeEl = target.closest('.architecture-node');
    
    if (!nodeEl) return; // Only show for nodes
    
    e.preventDefault();
    e.stopPropagation();

    // Find the node id from the React Flow wrapper
    const rfNode = nodeEl.closest('.react-flow__node');
    const nodeId = rfNode?.getAttribute('data-id') || null;

    // Get all currently selected node IDs
    const selectedEls = document.querySelectorAll('.react-flow__node.selected');
    const selectedIds: string[] = [];
    selectedEls.forEach(el => {
      const id = el.getAttribute('data-id');
      if (id) selectedIds.push(id);
    });

    // If right-clicked node isn't in selection, treat as single
    if (nodeId && !selectedIds.includes(nodeId)) {
      setMenu({ x: e.clientX, y: e.clientY, nodeId, selectedIds: [nodeId] });
    } else {
      setMenu({ x: e.clientX, y: e.clientY, nodeId, selectedIds });
    }
  }, []);

  const close = useCallback(() => setMenu(null), []);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [handleContextMenu, close]);

  if (!menu) return null;

  const targetNode = nodes.find(n => n.id === menu.nodeId);
  const config = targetNode ? NODE_TYPES_CONFIG.find(c => c.type === targetNode.data.nodeType) : null;
  const isMulti = menu.selectedIds.length > 1;

  return (
    <div
      className="fixed z-[100] min-w-[180px] rounded-xl border bg-popover/95 backdrop-blur-md shadow-xl py-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
      style={{ left: menu.x, top: menu.y }}
    >
      {targetNode && !isMulti && (
        <div className="px-3 py-1.5 border-b mb-1">
          <div className="flex items-center gap-2 text-xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: config ? `hsl(var(${config.colorVar}))` : undefined }}
            />
            <span className="font-medium truncate">{targetNode.data.label}</span>
          </div>
        </div>
      )}

      {isMulti && (
        <div className="px-3 py-1.5 border-b mb-1">
          <span className="text-xs text-muted-foreground">{menu.selectedIds.length} nodes selected</span>
        </div>
      )}

      {!isMulti && targetNode && (
        <button
          onClick={() => { onSelectNode(targetNode.id); close(); }}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent transition-colors text-left"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          Edit properties
        </button>
      )}

      <button
        onClick={() => { onDeleteNodes(menu.selectedIds); close(); }}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-destructive/10 text-destructive transition-colors text-left"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {isMulti ? `Delete ${menu.selectedIds.length} nodes` : 'Delete node'}
        <span className="ml-auto text-[10px] font-mono opacity-60">Del</span>
      </button>
    </div>
  );
}
