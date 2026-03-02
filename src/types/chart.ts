import type { Node, Edge } from '@xyflow/react';

export type NodeCategory = 'frontend' | 'backend' | 'datastore' | 'external';

export type NodeType =
  | 'react'
  | 'spring-boot'
  | 'go'
  | 'rust'
  | 'influxdb'
  | 'postgres'
  | 'loki'
  | 'discord'
  | 'n8n'
  | 'slack';

export type EdgeType = 'rest' | 'websocket' | 'webhook';

export interface NodeData {
  label: string;
  description: string;
  nodeType: NodeType;
  [key: string]: unknown;
}

export interface EdgeData {
  edgeType: EdgeType;
  description: string;
  [key: string]: unknown;
}

export type ArchNode = Node<NodeData>;
export type ArchEdge = Edge<EdgeData>;

export interface ChartData {
  id: string;
  name: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  createdAt: number;
  updatedAt: number;
}

export interface NodeTypeConfig {
  type: NodeType;
  label: string;
  category: NodeCategory;
  colorVar: string;
  icon: string;
}

export const NODE_TYPES_CONFIG: NodeTypeConfig[] = [
  { type: 'react', label: 'React', category: 'frontend', colorVar: '--node-frontend', icon: '⚛' },
  { type: 'spring-boot', label: 'Spring Boot', category: 'backend', colorVar: '--node-backend-spring', icon: '🍃' },
  { type: 'go', label: 'Go', category: 'backend', colorVar: '--node-backend-go', icon: '🐹' },
  { type: 'rust', label: 'Rust', category: 'backend', colorVar: '--node-backend-rust', icon: '⚙' },
  { type: 'influxdb', label: 'InfluxDB', category: 'datastore', colorVar: '--node-datastore-influx', icon: '📈' },
  { type: 'postgres', label: 'Postgres', category: 'datastore', colorVar: '--node-datastore-postgres', icon: '🐘' },
  { type: 'loki', label: 'Loki', category: 'datastore', colorVar: '--node-datastore-loki', icon: '📋' },
  { type: 'discord', label: 'Discord', category: 'external', colorVar: '--node-external-discord', icon: '💬' },
  { type: 'n8n', label: 'N8N', category: 'external', colorVar: '--node-external-n8n', icon: '🔗' },
  { type: 'slack', label: 'Slack', category: 'external', colorVar: '--node-external-slack', icon: '📱' },
];

export const EDGE_TYPES_CONFIG: { type: EdgeType; label: string; style: string }[] = [
  { type: 'rest', label: 'REST API', style: 'solid' },
  { type: 'websocket', label: 'WebSocket', style: 'dashed' },
  { type: 'webhook', label: 'Webhook', style: 'dotted' },
];

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  datastore: 'Datastores',
  external: 'External',
};
