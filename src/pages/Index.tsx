import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChartStorage } from '@/hooks/useChartStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Network, Sun, Moon, ChevronRight, Upload } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { charts, createChart, deleteChart } = useChartStorage();
  const [newName, setNewName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  const handleCreate = () => {
    const name = newName.trim() || 'Untitled Diagram';
    const chart = createChart(name);
    setNewName('');
    setDialogOpen(false);
    toast.success('Chart created');
    navigate(`/chart/${chart.id}`);
  };

  const handleCreateWithExample = () => {
    const chart = createChart('Example Architecture');
    // Add example nodes and edges
    const exampleNodes = [
      {
        id: 'node-1',
        type: 'architecture' as const,
        position: { x: 100, y: 100 },
        data: { label: 'React Frontend', description: 'Main SPA built with React and TypeScript. Serves the user interface.', nodeType: 'react' as const },
      },
      {
        id: 'node-2',
        type: 'architecture' as const,
        position: { x: 450, y: 100 },
        data: { label: 'API Server', description: 'Spring Boot REST API. Handles business logic and authentication.', nodeType: 'spring-boot' as const },
      },
      {
        id: 'node-3',
        type: 'architecture' as const,
        position: { x: 450, y: 320 },
        data: { label: 'Database', description: 'PostgreSQL database for persistent storage.', nodeType: 'postgres' as const },
      },
    ];
    const exampleEdges = [
      {
        id: 'e-1',
        source: 'node-1',
        target: 'node-2',
        type: 'architecture' as const,
        data: { edgeType: 'rest' as const, description: 'HTTP/JSON' },
      },
      {
        id: 'e-2',
        source: 'node-2',
        target: 'node-3',
        type: 'architecture' as const,
        data: { edgeType: 'rest' as const, description: 'SQL queries' },
      },
    ];

    // Need to import from hooks
    const all = JSON.parse(localStorage.getItem('archflow-charts') || '[]');
    const idx = all.findIndex((c: { id: string }) => c.id === chart.id);
    if (idx !== -1) {
      all[idx].nodes = exampleNodes;
      all[idx].edges = exampleEdges;
      localStorage.setItem('archflow-charts', JSON.stringify(all));
    }
    navigate(`/chart/${chart.id}`);
  };

  const toggleDarkMode = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('archflow-theme', next ? 'dark' : 'light');
    setDarkMode(next);
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.nodes || !data.edges) {
          toast.error('Invalid diagram file');
          return;
        }
        const name = file.name.replace(/\.json$/i, '') || 'Imported Diagram';
        const chart = createChart(name);
        // Write imported nodes/edges into the chart
        const all = JSON.parse(localStorage.getItem('archflow-charts') || '[]');
        const idx = all.findIndex((c: { id: string }) => c.id === chart.id);
        if (idx !== -1) {
          all[idx].nodes = data.nodes;
          all[idx].edges = data.edges;
          localStorage.setItem('archflow-charts', JSON.stringify(all));
        }
        // Import custom types if present
        if (Array.isArray(data.customNodeTypes) || Array.isArray(data.customEdgeTypes)) {
          const existing = JSON.parse(localStorage.getItem('archflow-custom-types') || '{"nodeTypes":[],"edgeTypes":[]}');
          const existingNodeIds = new Set((existing.nodeTypes || []).map((t: { id: string }) => t.id));
          const existingEdgeIds = new Set((existing.edgeTypes || []).map((t: { id: string }) => t.id));
          const newNodes = (data.customNodeTypes || []).filter((t: { id: string }) => !existingNodeIds.has(t.id));
          const newEdges = (data.customEdgeTypes || []).filter((t: { id: string }) => !existingEdgeIds.has(t.id));
          existing.nodeTypes = [...(existing.nodeTypes || []), ...newNodes];
          existing.edgeTypes = [...(existing.edgeTypes || []), ...newEdges];
          localStorage.setItem('archflow-custom-types', JSON.stringify(existing));
        }
        toast.success('Diagram imported');
        navigate(`/chart/${chart.id}`);
      } catch {
        toast.error('Failed to parse JSON file');
      }
    };
    input.click();
  };

  const sortedCharts = [...charts].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-5xl flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <Network className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-lg font-mono tracking-tight">ArchFlow</h1>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="container max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your Diagrams</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage architecture diagrams
            </p>
          </div>
          <div className="flex gap-2">
            {charts.length === 0 && (
              <Button variant="outline" onClick={handleCreateWithExample}>
                <Plus className="h-4 w-4 mr-1.5" /> Start with Example
              </Button>
            )}
            <Button variant="outline" onClick={handleImportFile}>
              <Upload className="h-4 w-4 mr-1.5" /> Import from File
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1.5" /> New Diagram
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Diagram</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Diagram name..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    autoFocus
                  />
                  <Button onClick={handleCreate}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {sortedCharts.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-12 text-center">
            <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="font-semibold text-lg mb-1">No diagrams yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first architecture diagram to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {sortedCharts.map(chart => (
              <div
                key={chart.id}
                className="group border rounded-lg p-4 hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer flex items-center justify-between"
                onClick={() => navigate(`/chart/${chart.id}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Network className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm truncate">{chart.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {chart.nodes.length} nodes · {chart.edges.length} edges · {new Date(chart.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); deleteChart(chart.id); toast.success('Deleted'); }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
