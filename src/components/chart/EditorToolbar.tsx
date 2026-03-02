import { useReactFlow } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';
import {
  Download, Upload, Trash2, Maximize, Undo2, Redo2, Sun, Moon, FileJson, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface EditorToolbarProps {
  chartName: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onImportJson: (json: string) => void;
  onExportJson: () => string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function EditorToolbar({
  chartName, canUndo, canRedo,
  onUndo, onRedo, onClear,
  onImportJson, onExportJson,
  darkMode, onToggleDarkMode,
}: EditorToolbarProps) {
  const { fitView, getEdges } = useReactFlow();

  const exportImage = async (format: 'png' | 'svg', targetWidth?: number) => {
    const el = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!el) return;

    // Hide handles that have no edge connected
    const edges = getEdges();
    const connectedHandles = new Set<string>();
    for (const edge of edges) {
      if (edge.sourceHandle) {
        connectedHandles.add(`${edge.source}-source-${edge.sourceHandle}`);
      } else {
        connectedHandles.add(`${edge.source}-source-bottom`);
        connectedHandles.add(`${edge.source}-source-right`);
      }
      if (edge.targetHandle) {
        connectedHandles.add(`${edge.target}-target-${edge.targetHandle}`);
      } else {
        connectedHandles.add(`${edge.target}-target-top`);
        connectedHandles.add(`${edge.target}-target-left`);
      }
    }

    const handles = el.querySelectorAll('.react-flow__handle') as NodeListOf<HTMLElement>;
    const hiddenHandles: HTMLElement[] = [];
    for (const handle of handles) {
      const nodeId = handle.getAttribute('data-nodeid');
      const pos = handle.getAttribute('data-handlepos');
      const type = handle.classList.contains('source') ? 'source' : 'target';
      if (!connectedHandles.has(`${nodeId}-${type}-${pos}`)) {
        handle.style.display = 'none';
        hiddenHandles.push(handle);
      }
    }

    try {
      const fn = format === 'png' ? toPng : toSvg;
      const pixelRatio = targetWidth ? targetWidth / el.offsetWidth : 1;
      const url = await fn(el, { quality: 1, backgroundColor: 'transparent', pixelRatio, skipFonts: true });
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chartName}.${format}`;
      a.click();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('[Export] failed:', err);
      toast.error('Export failed');
    } finally {
      for (const handle of hiddenHandles) {
        handle.style.display = '';
      }
    }
  };

  const exportJson = () => {
    const json = onExportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${chartName}.json`;
    a.click();
    toast.success('Exported JSON');
  };

  const importJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      onImportJson(text);
      toast.success('Imported diagram');
    };
    input.click();
  };

  return (
    <div className="h-10 border-b bg-card flex items-center px-2 gap-1">
      <span className="font-semibold text-sm px-2 truncate max-w-[200px]">{chartName}</span>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        <Undo2 className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
        <Redo2 className="h-3.5 w-3.5" />
      </Button>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => fitView({ padding: 0.2 })} title="Fit View">
        <Maximize className="h-3.5 w-3.5" />
      </Button>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" title="Export Image">
            <Download className="h-3.5 w-3.5" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => exportImage('png', 1920)}>PNG 1080p (1920px)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportImage('png', 2560)}>PNG WQHD (2560px)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportImage('png', 3840)}>PNG 4K (3840px)</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => exportImage('svg')}>SVG (Vector)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={exportJson} title="Export JSON">
        <FileJson className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={importJson} title="Import JSON">
        <Upload className="h-3.5 w-3.5" />
      </Button>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear} title="Clear Canvas">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      <div className="flex-1" />

      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleDarkMode}>
        {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
