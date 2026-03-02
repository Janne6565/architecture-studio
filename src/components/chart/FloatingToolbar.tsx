import { useState, useMemo, useRef, useEffect } from 'react';
import { NODE_TYPES_CONFIG, EDGE_TYPES_CONFIG, CATEGORY_LABELS } from '@/types/chart';
import type { NodeType, EdgeType, NodeCategory } from '@/types/chart';
import { Input } from '@/components/ui/input';
import { Search, Monitor, Server, Database, Globe, Cable } from 'lucide-react';

interface FloatingToolbarProps {
  onAddNode: (type: NodeType) => void;
  selectedEdgeType: EdgeType;
  onEdgeTypeChange: (type: EdgeType) => void;
}

const CATEGORY_ICONS: Record<NodeCategory | 'connections', React.ReactNode> = {
  frontend: <Monitor className="h-4 w-4" />,
  backend: <Server className="h-4 w-4" />,
  datastore: <Database className="h-4 w-4" />,
  external: <Globe className="h-4 w-4" />,
  connections: <Cable className="h-4 w-4" />,
};

type ToolbarCategory = NodeCategory | 'connections';

export default function FloatingToolbar({ onAddNode, selectedEdgeType, onEdgeTypeChange }: FloatingToolbarProps) {
  const [activeCategory, setActiveCategory] = useState<ToolbarCategory | null>(null);
  const [search, setSearch] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>();

  const categories: { key: ToolbarCategory; label: string }[] = [
    { key: 'frontend', label: CATEGORY_LABELS.frontend },
    { key: 'backend', label: CATEGORY_LABELS.backend },
    { key: 'datastore', label: CATEGORY_LABELS.datastore },
    { key: 'external', label: CATEGORY_LABELS.external },
    { key: 'connections', label: 'Connections' },
  ];

  const filteredNodes = useMemo(() => {
    if (!activeCategory || activeCategory === 'connections') return [];
    const q = search.toLowerCase();
    return NODE_TYPES_CONFIG.filter(
      n => n.category === activeCategory && (n.label.toLowerCase().includes(q) || !q)
    );
  }, [activeCategory, search]);

  const filteredEdges = useMemo(() => {
    if (activeCategory !== 'connections') return [];
    const q = search.toLowerCase();
    return EDGE_TYPES_CONFIG.filter(e => e.label.toLowerCase().includes(q) || !q);
  }, [activeCategory, search]);

  const handleEnter = (key: ToolbarCategory) => {
    clearTimeout(hoverTimeout.current);
    setActiveCategory(key);
    setSearch('');
  };

  const handleLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setActiveCategory(null);
      setSearch('');
    }, 200);
  };

  const handlePopoverEnter = () => {
    clearTimeout(hoverTimeout.current);
  };

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        toolbarRef.current && !toolbarRef.current.contains(e.target as Node)
      ) {
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Popover */}
      {activeCategory && (
        <div
          ref={popoverRef}
          onMouseEnter={handlePopoverEnter}
          onMouseLeave={handleLeave}
          className="mb-2 w-64 rounded-xl border bg-popover/95 backdrop-blur-md shadow-xl p-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-150"
        >
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeCategory === 'connections' ? 'connections' : CATEGORY_LABELS[activeCategory]}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/50 border-0 focus-visible:ring-1"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {activeCategory !== 'connections' ? (
              filteredNodes.length > 0 ? (
                filteredNodes.map(n => (
                  <button
                    key={n.type}
                    onClick={() => {
                      onAddNode(n.type);
                      setActiveCategory(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left group"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `hsl(var(${n.colorVar}))` }}
                    />
                    <span className="text-base">{n.icon}</span>
                    <span className="text-xs font-medium">{n.label}</span>
                  </button>
                ))
              ) : (
                <div className="text-xs text-muted-foreground text-center py-3">No results</div>
              )
            ) : (
              filteredEdges.length > 0 ? (
                filteredEdges.map(e => (
                  <button
                    key={e.type}
                    onClick={() => {
                      onEdgeTypeChange(e.type);
                      setActiveCategory(null);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${
                      selectedEdgeType === e.type
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <span className="w-6 flex justify-center">
                      <span
                        className="block w-5 border-t-2"
                        style={{
                          borderStyle: e.style === 'solid' ? 'solid' : e.style === 'dashed' ? 'dashed' : 'dotted',
                          borderColor: selectedEdgeType === e.type ? 'hsl(var(--primary))' : 'currentColor',
                        }}
                      />
                    </span>
                    <span className="text-xs font-medium">{e.label}</span>
                    {selectedEdgeType === e.type && (
                      <span className="ml-auto text-[10px] font-mono text-primary">active</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-xs text-muted-foreground text-center py-3">No results</div>
              )
            )}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div
        ref={toolbarRef}
        className="flex items-center gap-1 rounded-2xl border bg-card/95 backdrop-blur-md shadow-xl px-2 py-1.5"
      >
        {categories.map(cat => (
          <button
            key={cat.key}
            onMouseEnter={() => handleEnter(cat.key)}
            onMouseLeave={handleLeave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeCategory === cat.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {CATEGORY_ICONS[cat.key]}
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
