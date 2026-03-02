import { useState, useCallback } from 'react';
import type { ChartData } from '@/types/chart';

const STORAGE_KEY = 'archflow-charts';

function sanitizeNode(node: unknown) {
  const n = node as Record<string, unknown>;
  const { measured, selected, dragging, resizing, width, height, ...rest } = n;
  return rest;
}

function sanitizeEdge(edge: unknown) {
  const e = edge as Record<string, unknown>;
  const { selected, ...rest } = e;
  return rest;
}

function sanitizeChart(chart: ChartData): ChartData {
  return {
    ...chart,
    nodes: (Array.isArray(chart.nodes) ? chart.nodes : []).map(sanitizeNode) as ChartData['nodes'],
    edges: (Array.isArray(chart.edges) ? chart.edges : []).map(sanitizeEdge) as ChartData['edges'],
  };
}

function loadCharts(): ChartData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((chart) => sanitizeChart(chart as ChartData));
  } catch {
    return [];
  }
}

function saveCharts(charts: ChartData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts.map(sanitizeChart)));
}

export function useChartStorage() {
  const [charts, setCharts] = useState<ChartData[]>(loadCharts);

  const refresh = useCallback(() => setCharts(loadCharts()), []);

  const createChart = useCallback((name: string): ChartData => {
    const chart: ChartData = {
      id: crypto.randomUUID(),
      name,
      nodes: [],
      edges: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...loadCharts(), chart];
    saveCharts(updated);
    setCharts(updated);
    return chart;
  }, []);

  const deleteChart = useCallback((id: string) => {
    const updated = loadCharts().filter(c => c.id !== id);
    saveCharts(updated);
    setCharts(updated);
  }, []);

  const getChart = useCallback((id: string): ChartData | undefined => {
    return loadCharts().find(c => c.id === id);
  }, []);

  const updateChart = useCallback((id: string, data: Partial<ChartData>) => {
    const all = loadCharts();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return;
    all[idx] = sanitizeChart({ ...all[idx], ...data, updatedAt: Date.now() } as ChartData);
    saveCharts(all);
    setCharts(all);
  }, []);

  const renameChart = useCallback((id: string, name: string) => {
    updateChart(id, { name });
  }, [updateChart]);

  return { charts, createChart, deleteChart, getChart, updateChart, renameChart, refresh };
}
