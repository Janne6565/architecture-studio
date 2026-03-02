import { useState, useCallback, useEffect } from 'react';
import type { CustomNodeTypeConfig, CustomEdgeTypeConfig } from '@/types/chart';

const STORAGE_KEY = 'archflow-custom-types';

interface CustomTypesData {
  nodeTypes: CustomNodeTypeConfig[];
  edgeTypes: CustomEdgeTypeConfig[];
}

function load(): CustomTypesData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        nodeTypes: Array.isArray(parsed.nodeTypes) ? parsed.nodeTypes : [],
        edgeTypes: Array.isArray(parsed.edgeTypes) ? parsed.edgeTypes : [],
      };
    }
  } catch {
    // ignore
  }
  return { nodeTypes: [], edgeTypes: [] };
}

function save(data: CustomTypesData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useCustomTypes() {
  const [customNodeTypes, setCustomNodeTypes] = useState<CustomNodeTypeConfig[]>(() => load().nodeTypes);
  const [customEdgeTypes, setCustomEdgeTypes] = useState<CustomEdgeTypeConfig[]>(() => load().edgeTypes);

  // Persist on change
  useEffect(() => {
    save({ nodeTypes: customNodeTypes, edgeTypes: customEdgeTypes });
  }, [customNodeTypes, customEdgeTypes]);

  const addNodeType = useCallback((cfg: Omit<CustomNodeTypeConfig, 'id'>) => {
    const entry: CustomNodeTypeConfig = { ...cfg, id: `ct-${uid()}` };
    setCustomNodeTypes(prev => [...prev, entry]);
    return entry;
  }, []);

  const updateNodeType = useCallback((id: string, patch: Partial<Omit<CustomNodeTypeConfig, 'id'>>) => {
    setCustomNodeTypes(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteNodeType = useCallback((id: string) => {
    setCustomNodeTypes(prev => prev.filter(t => t.id !== id));
  }, []);

  const addEdgeType = useCallback((cfg: Omit<CustomEdgeTypeConfig, 'id'>) => {
    const entry: CustomEdgeTypeConfig = { ...cfg, id: `ce-${uid()}` };
    setCustomEdgeTypes(prev => [...prev, entry]);
    return entry;
  }, []);

  const updateEdgeType = useCallback((id: string, patch: Partial<Omit<CustomEdgeTypeConfig, 'id'>>) => {
    setCustomEdgeTypes(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteEdgeType = useCallback((id: string) => {
    setCustomEdgeTypes(prev => prev.filter(t => t.id !== id));
  }, []);

  const importTypes = useCallback((nodeTypes: CustomNodeTypeConfig[], edgeTypes: CustomEdgeTypeConfig[]) => {
    // Merge imported types with existing, avoiding duplicate IDs
    setCustomNodeTypes(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newOnes = nodeTypes.filter(t => !existingIds.has(t.id));
      return [...prev, ...newOnes];
    });
    setCustomEdgeTypes(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newOnes = edgeTypes.filter(t => !existingIds.has(t.id));
      return [...prev, ...newOnes];
    });
  }, []);

  return {
    customNodeTypes,
    customEdgeTypes,
    addNodeType,
    updateNodeType,
    deleteNodeType,
    addEdgeType,
    updateEdgeType,
    deleteEdgeType,
    importTypes,
  };
}
