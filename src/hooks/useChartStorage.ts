import { useState, useCallback } from 'react';
import type { ChartData } from '@/types/chart';

const STORAGE_KEY = 'archflow-charts';

function loadCharts(): ChartData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCharts(charts: ChartData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
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
    all[idx] = { ...all[idx], ...data, updatedAt: Date.now() };
    saveCharts(all);
    setCharts(all);
  }, []);

  const renameChart = useCallback((id: string, name: string) => {
    updateChart(id, { name });
  }, [updateChart]);

  return { charts, createChart, deleteChart, getChart, updateChart, renameChart, refresh };
}
