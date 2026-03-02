import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NODE_TYPES_CONFIG, CATEGORY_LABELS } from '@/types/chart';
import { useCustomTypesContext } from '@/contexts/CustomTypesContext';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

interface QuickAddProps {
  onAddNode: (type: string) => void;
}

export default function QuickAdd({ onAddNode }: QuickAddProps) {
  const { customNodeTypes } = useCustomTypesContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  const allItems = useMemo(() => {
    const builtIn = NODE_TYPES_CONFIG.map(n => ({
      id: n.type,
      label: n.label,
      icon: n.icon,
      category: CATEGORY_LABELS[n.category],
      color: `hsl(var(${n.colorVar}))`,
      isCustom: false,
    }));
    const custom = customNodeTypes.map(n => ({
      id: n.id,
      label: n.label,
      icon: n.icon,
      category: 'Custom',
      color: n.color,
      isCustom: true,
    }));
    return [...builtIn, ...custom];
  }, [customNodeTypes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      n => n.label.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)
    );
  }, [search, allItems]);

  const openPalette = useCallback(() => {
    setSearch('');
    setFocusIndex(0);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  const selectItem = useCallback((id: string) => {
    onAddNode(id);
    closePalette();
  }, [onAddNode, closePalette]);

  // Global hotkey: Ctrl+K or /
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          if (open) closePalette(); else openPalette();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (open) closePalette(); else openPalette();
      }
      if (e.key === '/' && !open) {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, openPalette, closePalette]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault();
      selectItem(filtered[focusIndex]?.id ?? filtered[0].id);
    } else if (e.key === 'Escape') {
      closePalette();
    }
  }, [filtered, focusIndex, selectItem, closePalette]);

  // Scroll focused item into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-index="${focusIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusIndex, open]);

  // Reset focus index when filter changes
  useEffect(() => {
    setFocusIndex(0);
  }, [search]);

  // Group filtered results by category
  const grouped = useMemo(() => {
    const result: { category: string; items: typeof filtered }[] = [];
    const catMap = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const existing = catMap.get(item.category);
      if (existing) {
        existing.push(item);
      } else {
        const arr = [item];
        catMap.set(item.category, arr);
        result.push({ category: item.category, items: arr });
      }
    }
    return result;
  }, [filtered]);

  // Flat index counter for keyboard navigation
  let flatIdx = 0;

  return (
    <>
      {/* Inline trigger button */}
      <button
        onClick={openPalette}
        className="relative flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
        title="Quick Add (Ctrl+K or /)"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add</span>
        <kbd className="text-[10px] font-mono ml-0.5 opacity-70">/</kbd>
      </button>

      {/* Full-screen palette overlay via portal */}
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px]" onClick={closePalette} />

          <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[100] w-[400px] rounded-xl border bg-popover/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-4 duration-150">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Search components..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9 h-9 text-sm bg-muted/50 border-0 focus-visible:ring-1"
                />
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Esc
                </kbd>
              </div>
            </div>

            <div ref={listRef} className="max-h-[360px] overflow-y-auto p-1.5">
              {grouped.length > 0 ? (
                grouped.map(group => {
                  const items = group.items.map(item => {
                    const idx = flatIdx++;
                    return (
                      <button
                        key={item.id}
                        data-index={idx}
                        onClick={() => selectItem(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                          idx === focusIndex ? 'bg-accent' : 'hover:bg-muted'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-base flex-shrink-0">{item.icon}</span>
                        <span className="text-xs font-medium flex-1 truncate">{item.label}</span>
                        {item.isCustom && (
                          <span className="text-[10px] font-mono text-muted-foreground">custom</span>
                        )}
                      </button>
                    );
                  });

                  return (
                    <div key={group.category}>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 pt-2 pb-1">
                        {group.category}
                      </div>
                      {items}
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-muted-foreground text-center py-8">
                  No components found
                </div>
              )}
            </div>

            <div className="p-2 border-t text-[10px] text-muted-foreground text-center flex items-center justify-center gap-3">
              <span><kbd className="font-mono bg-muted px-1 py-0.5 rounded">↑↓</kbd> navigate</span>
              <span><kbd className="font-mono bg-muted px-1 py-0.5 rounded">Enter</kbd> add</span>
              <span><kbd className="font-mono bg-muted px-1 py-0.5 rounded">Esc</kbd> close</span>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
