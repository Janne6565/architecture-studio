import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { toPng, toSvg, toJpeg, toCanvas } from 'html-to-image';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type ImageFormat = 'png' | 'svg' | 'jpg' | 'webp';
type HandleVisibility = 'all' | 'connected' | 'none';
type BackgroundMode = 'transparent' | 'plain' | 'dots';
type Resolution = '1920' | '2560' | '3840';

interface ExportDialogProps {
  chartName: string;
}

export default function ExportDialog({ chartName }: ExportDialogProps) {
  const { getEdges } = useReactFlow();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ImageFormat>('png');
  const [handles, setHandles] = useState<HandleVisibility>('connected');
  const [background, setBackground] = useState<BackgroundMode>('transparent');
  const [resolution, setResolution] = useState<Resolution>('1920');
  const [exporting, setExporting] = useState(false);

  const isRaster = format !== 'svg';

  const doExport = async () => {
    // When exporting with dots, capture the full .react-flow container (includes background SVG).
    // Otherwise capture just the viewport for a clean transparent/plain export.
    const useFull = background === 'dots';
    const el = useFull
      ? (document.querySelector('.react-flow') as HTMLElement)
      : (document.querySelector('.react-flow__viewport') as HTMLElement);
    if (!el) return;
    setExporting(true);

    // --- Resolve background ---
    let bgColor: string | undefined;
    if (background === 'plain' || background === 'dots') {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
      bgColor = `hsl(${raw})`;
    }

    // For "dots" we keep the background layer; for others we hide it
    const bgPatternEl = document.querySelector('.react-flow__background') as HTMLElement | null;
    const dotsOriginalDisplay = bgPatternEl?.style.display ?? '';

    if (background !== 'dots' && bgPatternEl) {
      bgPatternEl.style.display = 'none';
    }

    // When capturing the full container, hide controls & minimap so they don't appear
    const uiElements: HTMLElement[] = [];
    if (useFull) {
      const selectors = ['.react-flow__controls', '.react-flow__minimap', '.react-flow__attribution'];
      for (const sel of selectors) {
        const uiEl = el.querySelector(sel) as HTMLElement | null;
        if (uiEl) {
          uiElements.push(uiEl);
          uiEl.style.display = 'none';
        }
      }
    }

    // --- Handle visibility ---
    const edges = getEdges();
    const connectedSet = new Set<string>();
    for (const edge of edges) {
      if (edge.sourceHandle) {
        connectedSet.add(`${edge.source}-source-${edge.sourceHandle}`);
      } else {
        connectedSet.add(`${edge.source}-source-bottom`);
        connectedSet.add(`${edge.source}-source-right`);
      }
      if (edge.targetHandle) {
        connectedSet.add(`${edge.target}-target-${edge.targetHandle}`);
      } else {
        connectedSet.add(`${edge.target}-target-top`);
        connectedSet.add(`${edge.target}-target-left`);
      }
    }

    const allHandles = el.querySelectorAll('.react-flow__handle') as NodeListOf<HTMLElement>;
    const hiddenHandles: HTMLElement[] = [];

    for (const handle of allHandles) {
      let shouldHide = false;
      if (handles === 'none') {
        shouldHide = true;
      } else if (handles === 'connected') {
        const nodeId = handle.getAttribute('data-nodeid');
        const pos = handle.getAttribute('data-handlepos');
        const type = handle.classList.contains('source') ? 'source' : 'target';
        if (!connectedSet.has(`${nodeId}-${type}-${pos}`)) {
          shouldHide = true;
        }
      }
      if (shouldHide) {
        handle.style.display = 'none';
        hiddenHandles.push(handle);
      }
    }

    try {
      const pixelRatio = isRaster ? Number(resolution) / el.offsetWidth : 1;
      const opts = {
        quality: format === 'jpg' ? 0.92 : 1,
        backgroundColor: bgColor ?? (format === 'jpg' ? '#ffffff' : 'transparent'),
        pixelRatio,
        skipFonts: true,
      };

      let url: string;
      const ext = format === 'jpg' ? 'jpg' : format;

      if (format === 'svg') {
        url = await toSvg(el, opts);
      } else if (format === 'jpg') {
        url = await toJpeg(el, opts);
      } else if (format === 'webp') {
        const canvas = await toCanvas(el, opts);
        url = canvas.toDataURL('image/webp', 0.92);
      } else {
        url = await toPng(el, opts);
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = `${chartName}.${ext}`;
      a.click();
      toast.success(`Exported as ${ext.toUpperCase()}`);
      setOpen(false);
    } catch (err) {
      console.error('[Export] failed:', err);
      toast.error('Export failed');
    } finally {
      for (const handle of hiddenHandles) {
        handle.style.display = '';
      }
      // Restore dots visibility
      if (bgPatternEl) {
        bgPatternEl.style.display = dotsOriginalDisplay;
      }
      // Restore UI elements
      for (const uiEl of uiElements) {
        uiEl.style.display = '';
      }
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Export Image">
          <Download className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Export Image</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Format */}
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium">Format</Label>
            <div className="flex gap-1.5">
              {(['png', 'svg', 'jpg', 'webp'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    format === f
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution — only for raster */}
          {isRaster && (
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Resolution</Label>
              <Select value={resolution} onValueChange={v => setResolution(v as Resolution)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1920">1920px (1080p)</SelectItem>
                  <SelectItem value="2560">2560px (WQHD)</SelectItem>
                  <SelectItem value="3840">3840px (4K)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Background */}
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium">Background</Label>
            <div className="flex gap-1.5">
              {([
                { value: 'transparent' as const, label: 'Transparent' },
                { value: 'plain' as const, label: 'Plain' },
                { value: 'dots' as const, label: 'With Dots' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setBackground(opt.value)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    background === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {format === 'jpg' && background === 'transparent' && (
              <p className="text-[10px] text-muted-foreground">JPG does not support transparency — white will be used.</p>
            )}
          </div>

          {/* Connection Points */}
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium">Connection Points</Label>
            <div className="flex gap-1.5">
              {([
                { value: 'all' as const, label: 'All' },
                { value: 'connected' as const, label: 'Only Connected' },
                { value: 'none' as const, label: 'None' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setHandles(opt.value)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    handles === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={doExport} disabled={exporting} className="w-full gap-2">
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
