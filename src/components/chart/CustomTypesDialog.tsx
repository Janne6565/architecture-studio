import { useState } from 'react';
import { useCustomTypesContext } from '@/contexts/CustomTypesContext';
import type { CustomNodeTypeConfig, CustomEdgeTypeConfig } from '@/types/chart';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shapes, Pencil, Trash2, Plus } from 'lucide-react';

// ---------- Node type form ----------

function NodeTypeForm({ onSubmit }: { onSubmit: (cfg: Omit<CustomNodeTypeConfig, 'id'>) => void }) {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleAdd = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    onSubmit({ label: trimmed, icon: icon || '⬡', color });
    setLabel('');
    setIcon('');
    setColor('#3b82f6');
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label className="text-xs">Label</Label>
        <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="My Service" className="h-8 text-xs mt-1" />
      </div>
      <div className="w-16">
        <Label className="text-xs">Icon</Label>
        <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="⬡" className="h-8 text-xs mt-1 text-center" maxLength={4} />
      </div>
      <div className="w-10">
        <Label className="text-xs">Color</Label>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="mt-1 h-8 w-full cursor-pointer rounded border bg-transparent p-0.5" />
      </div>
      <Button size="sm" className="h-8" onClick={handleAdd} disabled={!label.trim()}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add
      </Button>
    </div>
  );
}

function NodeTypeRow({
  item, onUpdate, onDelete,
}: {
  item: CustomNodeTypeConfig;
  onUpdate: (id: string, patch: Partial<Omit<CustomNodeTypeConfig, 'id'>>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(item.label);
  const [icon, setIcon] = useState(item.icon);
  const [color, setColor] = useState(item.color);

  const save = () => {
    onUpdate(item.id, { label: label.trim() || item.label, icon: icon || item.icon, color });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg border p-2">
        <Input value={label} onChange={e => setLabel(e.target.value)} className="h-7 text-xs flex-1" />
        <Input value={icon} onChange={e => setIcon(e.target.value)} className="h-7 text-xs w-12 text-center" maxLength={4} />
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-7 w-8 cursor-pointer rounded border bg-transparent p-0.5" />
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={save}>Save</Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted group">
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
      <span className="text-sm">{item.icon}</span>
      <span className="text-xs font-medium flex-1 truncate">{item.label}</span>
      <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
        <Pencil className="h-3 w-3" />
      </button>
      <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

// ---------- Edge type form ----------

const DASH_OPTIONS: { value: CustomEdgeTypeConfig['dashPattern']; label: string; css: string }[] = [
  { value: 'solid', label: 'Solid', css: 'solid' },
  { value: 'dashed', label: 'Dashed', css: 'dashed' },
  { value: 'dotted', label: 'Dotted', css: 'dotted' },
];

function EdgeTypeForm({ onSubmit }: { onSubmit: (cfg: Omit<CustomEdgeTypeConfig, 'id'>) => void }) {
  const [label, setLabel] = useState('');
  const [dashPattern, setDashPattern] = useState<CustomEdgeTypeConfig['dashPattern']>('solid');

  const handleAdd = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    onSubmit({ label: trimmed, dashPattern });
    setLabel('');
    setDashPattern('solid');
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label className="text-xs">Label</Label>
        <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Internal Bus" className="h-8 text-xs mt-1" />
      </div>
      <div className="w-32">
        <Label className="text-xs">Style</Label>
        <div className="flex gap-1 mt-1">
          {DASH_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDashPattern(opt.value)}
              className={`flex-1 h-8 rounded-md border text-[10px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                dashPattern === opt.value ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
              }`}
            >
              <span className="block w-5 border-t-2" style={{ borderStyle: opt.css }} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <Button size="sm" className="h-8" onClick={handleAdd} disabled={!label.trim()}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add
      </Button>
    </div>
  );
}

function EdgeTypeRow({
  item, onUpdate, onDelete,
}: {
  item: CustomEdgeTypeConfig;
  onUpdate: (id: string, patch: Partial<Omit<CustomEdgeTypeConfig, 'id'>>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(item.label);
  const [dashPattern, setDashPattern] = useState(item.dashPattern);

  const save = () => {
    onUpdate(item.id, { label: label.trim() || item.label, dashPattern });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg border p-2">
        <Input value={label} onChange={e => setLabel(e.target.value)} className="h-7 text-xs flex-1" />
        <div className="flex gap-1">
          {DASH_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDashPattern(opt.value)}
              className={`h-7 w-7 rounded-md border flex items-center justify-center transition-colors ${
                dashPattern === opt.value ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
              }`}
            >
              <span className="block w-4 border-t-2" style={{ borderStyle: opt.css }} />
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={save}>Save</Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    );
  }

  const dashCss = DASH_OPTIONS.find(o => o.value === item.dashPattern)?.css ?? 'solid';

  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted group">
      <span className="w-6 flex justify-center">
        <span className="block w-5 border-t-2" style={{ borderStyle: dashCss }} />
      </span>
      <span className="text-xs font-medium flex-1 truncate">{item.label}</span>
      <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
        <Pencil className="h-3 w-3" />
      </button>
      <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

// ---------- Main dialog ----------

interface CustomTypesDialogProps {
  trigger?: React.ReactNode;
  defaultTab?: 'nodes' | 'edges';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CustomTypesDialog({ trigger, defaultTab = 'nodes', open, onOpenChange }: CustomTypesDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const {
    customNodeTypes, customEdgeTypes,
    addNodeType, updateNodeType, deleteNodeType,
    addEdgeType, updateEdgeType, deleteEdgeType,
  } = useCustomTypesContext();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <span onClick={() => setIsOpen(true)}>
          {trigger}
        </span>
      )}
      <DialogContent className="sm:max-w-lg" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Custom Types</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nodes">Node Types ({customNodeTypes.length})</TabsTrigger>
            <TabsTrigger value="edges">Connection Types ({customEdgeTypes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="space-y-3 mt-3">
            <NodeTypeForm onSubmit={addNodeType} />
            {customNodeTypes.length > 0 ? (
              <div className="space-y-0.5 max-h-60 overflow-y-auto">
                {customNodeTypes.map(t => (
                  <NodeTypeRow key={t.id} item={t} onUpdate={updateNodeType} onDelete={deleteNodeType} />
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-6">
                No custom node types yet. Add one above.
              </div>
            )}
          </TabsContent>

          <TabsContent value="edges" className="space-y-3 mt-3">
            <EdgeTypeForm onSubmit={addEdgeType} />
            {customEdgeTypes.length > 0 ? (
              <div className="space-y-0.5 max-h-60 overflow-y-auto">
                {customEdgeTypes.map(t => (
                  <EdgeTypeRow key={t.id} item={t} onUpdate={updateEdgeType} onDelete={deleteEdgeType} />
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-6">
                No custom connection types yet. Add one above.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
