import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { NODE_TYPES_CONFIG, EDGE_TYPES_CONFIG, CATEGORY_LABELS } from '@/types/chart';
import type { NodeCategory } from '@/types/chart';
import { useCustomTypesContext } from '@/contexts/CustomTypesContext';
import CustomTypesDialog from '@/components/chart/CustomTypesDialog';
import { Input } from '@/components/ui/input';
import { Search, Monitor, Server, Database, Globe, Cable, Container, MessageSquare, Activity, Shield, Puzzle, Plus } from 'lucide-react';

interface FloatingToolbarProps {
  onAddNode: (type: string) => void;
  selectedEdgeType: string;
  onEdgeTypeChange: (type: string) => void;
}

type ToolbarCategory = NodeCategory | 'connections' | 'custom';

const CATEGORIES: { key: ToolbarCategory; label: string; shortcut: string }[] = [
  { key: 'frontend', label: CATEGORY_LABELS.frontend, shortcut: 'F' },
  { key: 'backend', label: CATEGORY_LABELS.backend, shortcut: 'B' },
  { key: 'datastore', label: CATEGORY_LABELS.datastore, shortcut: 'D' },
  { key: 'devops', label: 'DevOps', shortcut: 'I' },
  { key: 'messaging', label: 'Messaging', shortcut: 'M' },
  { key: 'monitoring', label: 'Monitoring', shortcut: 'O' },
  { key: 'auth', label: 'Auth', shortcut: 'A' },
  { key: 'external', label: CATEGORY_LABELS.external, shortcut: 'E' },
  { key: 'custom', label: 'Custom', shortcut: 'U' },
  { key: 'connections', label: 'Connections', shortcut: 'C' },
];

const CATEGORY_ICONS: Record<ToolbarCategory, React.ReactNode> = {
  frontend: <Monitor className="h-4 w-4" />,
  backend: <Server className="h-4 w-4" />,
  datastore: <Database className="h-4 w-4" />,
  devops: <Container className="h-4 w-4" />,
  messaging: <MessageSquare className="h-4 w-4" />,
  monitoring: <Activity className="h-4 w-4" />,
  auth: <Shield className="h-4 w-4" />,
  external: <Globe className="h-4 w-4" />,
  custom: <Puzzle className="h-4 w-4" />,
  connections: <Cable className="h-4 w-4" />,
};

export default function FloatingToolbar({ onAddNode, selectedEdgeType, onEdgeTypeChange }: FloatingToolbarProps) {
  const { customNodeTypes, customEdgeTypes } = useCustomTypesContext();
  const [activeCategory, setActiveCategory] = useState<ToolbarCategory | null>(null);
  const [search, setSearch] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [popoverLeft, setPopoverLeft] = useState(0);
  const openedViaKeyboard = useRef(false);

  const filteredNodes = useMemo(() => {
    if (!activeCategory || activeCategory === 'connections' || activeCategory === 'custom') return [];
    const q = search.toLowerCase();
    return NODE_TYPES_CONFIG.filter(
      n => n.category === activeCategory && (n.label.toLowerCase().includes(q) || !q)
    );
  }, [activeCategory, search]);

  const filteredCustomNodes = useMemo(() => {
    if (activeCategory !== 'custom') return [];
    const q = search.toLowerCase();
    return customNodeTypes.filter(n => n.label.toLowerCase().includes(q) || !q);
  }, [activeCategory, search, customNodeTypes]);

  const filteredEdges = useMemo(() => {
    if (activeCategory !== 'connections') return [];
    const q = search.toLowerCase();
    return EDGE_TYPES_CONFIG.filter(e => e.label.toLowerCase().includes(q) || !q);
  }, [activeCategory, search]);

  const filteredCustomEdges = useMemo(() => {
    if (activeCategory !== 'connections') return [];
    const q = search.toLowerCase();
    return customEdgeTypes.filter(e => e.label.toLowerCase().includes(q) || !q);
  }, [activeCategory, search, customEdgeTypes]);

  const positionPopover = useCallback((key: ToolbarCategory) => {
    const btn = buttonRefs.current[key];
    const toolbar = toolbarRef.current;
    if (!btn || !toolbar) return;
    const btnRect = btn.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    // Center popover on button, relative to toolbar
    setPopoverLeft(btnRect.left - toolbarRect.left + btnRect.width / 2 - 128); // 128 = half of w-64
  }, []);

  const openCategory = useCallback((key: ToolbarCategory, viaKeyboard = false) => {
    clearTimeout(hoverTimeout.current);
    openedViaKeyboard.current = viaKeyboard;
    setActiveCategory(key);
    setSearch('');
    positionPopover(key);
    // Focus search after render
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [positionPopover]);

  const closeCategory = useCallback(() => {
    setActiveCategory(null);
    setSearch('');
    openedViaKeyboard.current = false;
  }, []);

  const handleEnter = (key: ToolbarCategory) => {
    clearTimeout(hoverTimeout.current);
    openCategory(key);
  };

  const handleLeave = () => {
    hoverTimeout.current = setTimeout(() => closeCategory(), 200);
  };

  const handlePopoverEnter = () => {
    clearTimeout(hoverTimeout.current);
  };

  // Select first item on Enter
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeCategory === 'connections' && filteredEdges.length > 0) {
        onEdgeTypeChange(filteredEdges[0].type);
        closeCategory();
      } else if (activeCategory === 'connections' && filteredCustomEdges.length > 0) {
        onEdgeTypeChange(filteredCustomEdges[0].id);
        closeCategory();
      } else if (activeCategory === 'custom' && filteredCustomNodes.length > 0) {
        onAddNode(filteredCustomNodes[0].id);
        closeCategory();
      } else if (activeCategory && activeCategory !== 'connections' && activeCategory !== 'custom' && filteredNodes.length > 0) {
        onAddNode(filteredNodes[0].type);
        closeCategory();
      }
    }
    if (e.key === 'Escape') {
      closeCategory();
    }
  }, [activeCategory, filteredNodes, filteredEdges, filteredCustomNodes, filteredCustomEdges, onAddNode, onEdgeTypeChange, closeCategory]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const shortcut = e.key.toUpperCase();
      const cat = CATEGORIES.find(c => c.shortcut === shortcut);
      if (cat) {
        e.preventDefault();
        if (activeCategory === cat.key) {
          closeCategory();
        } else {
          openCategory(cat.key, true);
        }
      }
      if (e.key === 'Escape' && activeCategory) {
        closeCategory();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeCategory, openCategory, closeCategory]);

  // Close on click outside (but not when clicking inside a dialog overlay)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        toolbarRef.current && !toolbarRef.current.contains(target) &&
        !target.closest('[role="dialog"]') &&
        !target.closest('[data-radix-portal]')
      ) {
        closeCategory();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeCategory]);

  // Active edge label for the connections button
  const activeEdgeLabel = EDGE_TYPES_CONFIG.find(e => e.type === selectedEdgeType)?.label
    ?? customEdgeTypes.find(e => e.id === selectedEdgeType)?.label;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* Toolbar */}
      <div ref={toolbarRef} className="relative">
        {/* Popover — positioned above the active button */}
        {activeCategory && (
          <div
            ref={popoverRef}
            onMouseEnter={handlePopoverEnter}
            onMouseLeave={handleLeave}
            className="absolute bottom-full mb-2 w-64 rounded-xl border bg-popover/95 backdrop-blur-md shadow-xl p-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-150"
            style={{ left: `${popoverLeft}px` }}
          >
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder={`Search ${activeCategory === 'connections' ? 'connections' : activeCategory === 'custom' ? 'custom types' : CATEGORY_LABELS[activeCategory]}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-8 h-8 text-xs bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {activeCategory === 'custom' ? (
                <>
                  {filteredCustomNodes.length > 0 ? (
                    filteredCustomNodes.map((n, i) => (
                      <button
                        key={n.id}
                        onClick={() => { onAddNode(n.id); closeCategory(); }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left ${
                          i === 0 && search ? 'bg-accent/50' : ''
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: n.color }}
                        />
                        <span className="text-base">{n.icon}</span>
                        <span className="text-xs font-medium">{n.label}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-3">
                      {customNodeTypes.length === 0 ? 'No custom node types yet' : 'No results'}
                    </div>
                  )}
                  <div className="pt-1 mt-1 border-t">
                    <CustomTypesDialog
                      defaultTab="nodes"
                      trigger={
                        <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-primary hover:bg-accent transition-colors text-left">
                          <Plus className="h-3.5 w-3.5" />
                          Create new type...
                        </button>
                      }
                    />
                  </div>
                </>
              ) : activeCategory !== 'connections' ? (
                filteredNodes.length > 0 ? (
                  filteredNodes.map((n, i) => (
                    <button
                      key={n.type}
                      onClick={() => { onAddNode(n.type); closeCategory(); }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left ${
                        i === 0 && search ? 'bg-accent/50' : ''
                      }`}
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
                (filteredEdges.length > 0 || filteredCustomEdges.length > 0) ? (
                  <>
                    {filteredEdges.map((e, i) => (
                      <button
                        key={e.type}
                        onClick={() => { onEdgeTypeChange(e.type); closeCategory(); }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${
                          selectedEdgeType === e.type
                            ? 'bg-primary/10 text-primary'
                            : i === 0 && search ? 'bg-accent/50' : 'hover:bg-accent'
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
                    ))}
                    {filteredCustomEdges.length > 0 && filteredEdges.length > 0 && (
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2.5 pt-2 pb-1">Custom</div>
                    )}
                    {filteredCustomEdges.map(ce => (
                      <button
                        key={ce.id}
                        onClick={() => { onEdgeTypeChange(ce.id); closeCategory(); }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${
                          selectedEdgeType === ce.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <span className="w-6 flex justify-center">
                          <span
                            className="block w-5 border-t-2"
                            style={{
                              borderStyle: ce.dashPattern,
                              borderColor: selectedEdgeType === ce.id ? 'hsl(var(--primary))' : 'currentColor',
                            }}
                          />
                        </span>
                        <span className="text-xs font-medium">{ce.label}</span>
                        {selectedEdgeType === ce.id && (
                          <span className="ml-auto text-[10px] font-mono text-primary">active</span>
                        )}
                      </button>
                    ))}
                    <div className="pt-1 mt-1 border-t">
                      <CustomTypesDialog
                        defaultTab="edges"
                        trigger={
                          <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-primary hover:bg-accent transition-colors text-left">
                            <Plus className="h-3.5 w-3.5" />
                            Create new connection type...
                          </button>
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-3">No results</div>
                )
              )}
            </div>

            {/* Hint */}
            <div className="mt-2 pt-2 border-t text-[10px] text-muted-foreground text-center">
              {search ? 'Press Enter to select first · Esc to close' : `Press ${CATEGORIES.find(c => c.key === activeCategory)?.shortcut} to toggle`}
            </div>
          </div>
        )}

        {/* Button bar */}
        <div className="flex items-center gap-1 rounded-2xl border bg-card/95 backdrop-blur-md shadow-xl px-2 py-1.5">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key;
            const isConnectionsWithSelection = cat.key === 'connections';
            return (
              <button
                key={cat.key}
                ref={el => { buttonRefs.current[cat.key] = el; }}
                onMouseEnter={() => handleEnter(cat.key)}
                onMouseLeave={handleLeave}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {CATEGORY_ICONS[cat.key]}
                <span className="hidden sm:inline">{cat.label}</span>
                {isConnectionsWithSelection && (
                  <span className={`hidden sm:inline text-[10px] font-mono ml-0.5 ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                    ({activeEdgeLabel})
                  </span>
                )}
                <span className="text-[10px] font-mono ml-1">{cat.shortcut}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
