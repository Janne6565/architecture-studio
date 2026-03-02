import { useReactFlow } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';
import {
  Download, Upload, Trash2, Maximize, Undo2, Redo2, Sun, Moon, FileJson,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  const { fitView } = useReactFlow();

  const exportImage = async (format: 'png' | 'svg') => {
    const el = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!el) return;
    try {
      const fn = format === 'png' ? toPng : toSvg;
      const url = await fn(el, { quality: 1, backgroundColor: 'transparent' });
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chartName}.${format}`;
      a.click();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
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

      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => exportImage('png')} title="Export PNG">
        <Download className="h-3.5 w-3.5" />
      </Button>
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
