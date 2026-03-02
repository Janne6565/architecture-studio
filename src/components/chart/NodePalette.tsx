import { useState, useMemo } from 'react';
import { NODE_TYPES_CONFIG, CATEGORY_LABELS, EDGE_TYPES_CONFIG } from '@/types/chart';
import type { NodeType, EdgeType, NodeCategory } from '@/types/chart';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void;
  selectedEdgeType: EdgeType;
  onEdgeTypeChange: (type: EdgeType) => void;
}

export default function NodePalette({ onAddNode, selectedEdgeType, onEdgeTypeChange }: NodePaletteProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return NODE_TYPES_CONFIG.filter(
      n => n.label.toLowerCase().includes(q) || n.category.includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Partial<Record<NodeCategory, typeof filtered>> = {};
    for (const n of filtered) {
      (groups[n.category] ??= []).push(n);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="w-56 border-r bg-card flex flex-col h-full">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm mb-2">Components</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {(Object.entries(grouped) as [NodeCategory, typeof filtered][]).map(([cat, items]) => (
          <div key={cat}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 px-1">
              {CATEGORY_LABELS[cat]}
            </div>
            <div className="space-y-0.5">
              {items.map(n => (
                <button
                  key={n.type}
                  onClick={() => onAddNode(n.type)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors text-left"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `hsl(var(${n.colorVar}))` }}
                  />
                  <span className="mr-1">{n.icon}</span>
                  <span className="text-xs">{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
          Connection Type
        </div>
        <div className="space-y-0.5">
          {EDGE_TYPES_CONFIG.map(e => (
            <button
              key={e.type}
              onClick={() => onEdgeTypeChange(e.type)}
              className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors ${
                selectedEdgeType === e.type
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
