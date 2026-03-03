import type { Node, Edge } from '@xyflow/react';

export type NodeCategory = 'frontend' | 'backend' | 'datastore' | 'external' | 'devops' | 'messaging' | 'monitoring' | 'auth';

export type NodeType =
  // Frontend
  | 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs' | 'nuxt' | 'remix' | 'astro' | 'solidjs' | 'htmx'
  // Backend
  | 'spring-boot' | 'go' | 'rust' | 'express' | 'nestjs' | 'fastapi' | 'django' | 'rails' | 'laravel' | 'dotnet' | 'flask' | 'actix' | 'gin' | 'fiber'
  // Datastore
  | 'postgres' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch' | 'cassandra' | 'dynamodb' | 'sqlite' | 'influxdb' | 'loki' | 'neo4j' | 'cockroachdb' | 'supabase' | 'firebase-db' | 'planetscale'
  // External
  | 'discord' | 'slack' | 'n8n' | 'stripe' | 'twilio' | 'sendgrid' | 'aws-s3' | 'cloudflare' | 'github' | 'gitlab' | 'jira' | 'zapier' | 'webhook-site'
  // DevOps
  | 'docker' | 'kubernetes' | 'terraform' | 'jenkins' | 'github-actions' | 'gitlab-ci' | 'argocd' | 'ansible' | 'nginx' | 'traefik' | 'vault' | 'consul'
  // Messaging
  | 'kafka' | 'rabbitmq' | 'redis-pubsub' | 'sqs' | 'nats' | 'pulsar' | 'eventbridge'
  // Monitoring
  | 'grafana' | 'prometheus' | 'datadog' | 'sentry' | 'elk' | 'jaeger' | 'pagerduty' | 'newrelic'
  // Auth
  | 'keycloak' | 'auth0' | 'okta' | 'firebase-auth' | 'clerk' | 'supabase-auth';

export type EdgeType = 'rest' | 'websocket' | 'webhook' | 'grpc' | 'graphql' | 'mqtt' | 'amqp';

export interface CustomNodeTypeConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface CustomEdgeTypeConfig {
  id: string;
  label: string;
  dashPattern: 'solid' | 'dashed' | 'dotted';
  color?: string;
}

export type NodeStyleType = 'default' | 'disabled' | 'locked' | 'example';

export interface NodeData {
  label: string;
  description: string;
  url?: string;
  nodeType: string;
  styleType?: NodeStyleType;
  [key: string]: unknown;
}

export type EdgeDirection = 'forward' | 'reverse' | 'bidirectional' | 'none';

export interface EdgeData {
  edgeType: string;
  description: string;
  direction: EdgeDirection;
  labelPosition?: number; // 0–1 ratio along edge path, default 0.5
  labelWidth?: number; // px width of the label chip, default 80
  [key: string]: unknown;
}

export type ArchNode = Node<NodeData>;
export type ArchEdge = Edge<EdgeData>;

export interface GroupNodeData {
  label: string;
  [key: string]: unknown;
}
export type GroupNode = Node<GroupNodeData>;
export type AnyNode = ArchNode | GroupNode;

export interface ChartData {
  id: string;
  name: string;
  nodes: AnyNode[];
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
  // Frontend
  { type: 'react', label: 'React', category: 'frontend', colorVar: '--node-frontend', icon: '⚛' },
  { type: 'vue', label: 'Vue.js', category: 'frontend', colorVar: '--node-frontend-vue', icon: '💚' },
  { type: 'angular', label: 'Angular', category: 'frontend', colorVar: '--node-frontend-angular', icon: '🅰' },
  { type: 'svelte', label: 'Svelte', category: 'frontend', colorVar: '--node-frontend-svelte', icon: '🔥' },
  { type: 'nextjs', label: 'Next.js', category: 'frontend', colorVar: '--node-frontend-next', icon: '▲' },
  { type: 'nuxt', label: 'Nuxt', category: 'frontend', colorVar: '--node-frontend-vue', icon: '💚' },
  { type: 'remix', label: 'Remix', category: 'frontend', colorVar: '--node-frontend', icon: '💿' },
  { type: 'astro', label: 'Astro', category: 'frontend', colorVar: '--node-frontend-astro', icon: '🚀' },
  { type: 'solidjs', label: 'SolidJS', category: 'frontend', colorVar: '--node-frontend', icon: '💎' },
  { type: 'htmx', label: 'HTMX', category: 'frontend', colorVar: '--node-frontend-next', icon: '📄' },

  // Backend
  { type: 'spring-boot', label: 'Spring Boot', category: 'backend', colorVar: '--node-backend-spring', icon: '🍃' },
  { type: 'go', label: 'Go', category: 'backend', colorVar: '--node-backend-go', icon: '🐹' },
  { type: 'rust', label: 'Rust', category: 'backend', colorVar: '--node-backend-rust', icon: '⚙' },
  { type: 'express', label: 'Express', category: 'backend', colorVar: '--node-backend-express', icon: '🟢' },
  { type: 'nestjs', label: 'NestJS', category: 'backend', colorVar: '--node-backend-nest', icon: '🐱' },
  { type: 'fastapi', label: 'FastAPI', category: 'backend', colorVar: '--node-backend-fastapi', icon: '⚡' },
  { type: 'django', label: 'Django', category: 'backend', colorVar: '--node-backend-django', icon: '🎸' },
  { type: 'rails', label: 'Rails', category: 'backend', colorVar: '--node-backend-rails', icon: '💎' },
  { type: 'laravel', label: 'Laravel', category: 'backend', colorVar: '--node-backend-laravel', icon: '🔺' },
  { type: 'dotnet', label: '.NET', category: 'backend', colorVar: '--node-backend-dotnet', icon: '🟣' },
  { type: 'flask', label: 'Flask', category: 'backend', colorVar: '--node-backend-flask', icon: '🧪' },
  { type: 'actix', label: 'Actix', category: 'backend', colorVar: '--node-backend-rust', icon: '⚙' },
  { type: 'gin', label: 'Gin', category: 'backend', colorVar: '--node-backend-go', icon: '🐹' },
  { type: 'fiber', label: 'Fiber', category: 'backend', colorVar: '--node-backend-go', icon: '🐹' },

  // Datastore
  { type: 'postgres', label: 'Postgres', category: 'datastore', colorVar: '--node-datastore-postgres', icon: '🐘' },
  { type: 'mysql', label: 'MySQL', category: 'datastore', colorVar: '--node-datastore-mysql', icon: '🐬' },
  { type: 'mongodb', label: 'MongoDB', category: 'datastore', colorVar: '--node-datastore-mongo', icon: '🍃' },
  { type: 'redis', label: 'Redis', category: 'datastore', colorVar: '--node-datastore-redis', icon: '🔴' },
  { type: 'elasticsearch', label: 'Elasticsearch', category: 'datastore', colorVar: '--node-datastore-elastic', icon: '🔍' },
  { type: 'cassandra', label: 'Cassandra', category: 'datastore', colorVar: '--node-datastore-cassandra', icon: '👁' },
  { type: 'dynamodb', label: 'DynamoDB', category: 'datastore', colorVar: '--node-datastore-dynamo', icon: '⚡' },
  { type: 'sqlite', label: 'SQLite', category: 'datastore', colorVar: '--node-datastore-sqlite', icon: '📦' },
  { type: 'influxdb', label: 'InfluxDB', category: 'datastore', colorVar: '--node-datastore-influx', icon: '📈' },
  { type: 'loki', label: 'Loki', category: 'datastore', colorVar: '--node-datastore-loki', icon: '📋' },
  { type: 'neo4j', label: 'Neo4j', category: 'datastore', colorVar: '--node-datastore-neo4j', icon: '🕸' },
  { type: 'cockroachdb', label: 'CockroachDB', category: 'datastore', colorVar: '--node-datastore-cockroach', icon: '🪳' },
  { type: 'supabase', label: 'Supabase', category: 'datastore', colorVar: '--node-datastore-supabase', icon: '⚡' },
  { type: 'firebase-db', label: 'Firebase', category: 'datastore', colorVar: '--node-datastore-firebase', icon: '🔥' },
  { type: 'planetscale', label: 'PlanetScale', category: 'datastore', colorVar: '--node-datastore-planetscale', icon: '🪐' },

  // External
  { type: 'discord', label: 'Discord', category: 'external', colorVar: '--node-external-discord', icon: '💬' },
  { type: 'slack', label: 'Slack', category: 'external', colorVar: '--node-external-slack', icon: '📱' },
  { type: 'n8n', label: 'N8N', category: 'external', colorVar: '--node-external-n8n', icon: '🔗' },
  { type: 'stripe', label: 'Stripe', category: 'external', colorVar: '--node-external-stripe', icon: '💳' },
  { type: 'twilio', label: 'Twilio', category: 'external', colorVar: '--node-external-twilio', icon: '📞' },
  { type: 'sendgrid', label: 'SendGrid', category: 'external', colorVar: '--node-external-sendgrid', icon: '✉' },
  { type: 'aws-s3', label: 'AWS S3', category: 'external', colorVar: '--node-external-aws', icon: '☁' },
  { type: 'cloudflare', label: 'Cloudflare', category: 'external', colorVar: '--node-external-cloudflare', icon: '🔶' },
  { type: 'github', label: 'GitHub', category: 'external', colorVar: '--node-external-github', icon: '🐙' },
  { type: 'gitlab', label: 'GitLab', category: 'external', colorVar: '--node-external-gitlab', icon: '🦊' },
  { type: 'jira', label: 'Jira', category: 'external', colorVar: '--node-external-jira', icon: '📋' },
  { type: 'zapier', label: 'Zapier', category: 'external', colorVar: '--node-external-zapier', icon: '⚡' },
  { type: 'webhook-site', label: 'Webhook.site', category: 'external', colorVar: '--node-external-webhook', icon: '🪝' },

  // DevOps / Infra
  { type: 'docker', label: 'Docker', category: 'devops', colorVar: '--node-devops-docker', icon: '🐳' },
  { type: 'kubernetes', label: 'Kubernetes', category: 'devops', colorVar: '--node-devops-k8s', icon: '☸' },
  { type: 'terraform', label: 'Terraform', category: 'devops', colorVar: '--node-devops-terraform', icon: '🏗' },
  { type: 'jenkins', label: 'Jenkins', category: 'devops', colorVar: '--node-devops-jenkins', icon: '🎩' },
  { type: 'github-actions', label: 'GitHub Actions', category: 'devops', colorVar: '--node-devops-gha', icon: '⚙' },
  { type: 'gitlab-ci', label: 'GitLab CI', category: 'devops', colorVar: '--node-devops-gitlab', icon: '🦊' },
  { type: 'argocd', label: 'ArgoCD', category: 'devops', colorVar: '--node-devops-argo', icon: '🐙' },
  { type: 'ansible', label: 'Ansible', category: 'devops', colorVar: '--node-devops-ansible', icon: '📜' },
  { type: 'nginx', label: 'Nginx', category: 'devops', colorVar: '--node-devops-nginx', icon: '🟩' },
  { type: 'traefik', label: 'Traefik', category: 'devops', colorVar: '--node-devops-traefik', icon: '🔀' },
  { type: 'vault', label: 'Vault', category: 'devops', colorVar: '--node-devops-vault', icon: '🔐' },
  { type: 'consul', label: 'Consul', category: 'devops', colorVar: '--node-devops-consul', icon: '🏛' },

  // Messaging / Queue
  { type: 'kafka', label: 'Kafka', category: 'messaging', colorVar: '--node-messaging-kafka', icon: '📨' },
  { type: 'rabbitmq', label: 'RabbitMQ', category: 'messaging', colorVar: '--node-messaging-rabbit', icon: '🐰' },
  { type: 'redis-pubsub', label: 'Redis Pub/Sub', category: 'messaging', colorVar: '--node-messaging-redis', icon: '🔴' },
  { type: 'sqs', label: 'AWS SQS', category: 'messaging', colorVar: '--node-messaging-sqs', icon: '📬' },
  { type: 'nats', label: 'NATS', category: 'messaging', colorVar: '--node-messaging-nats', icon: '⚡' },
  { type: 'pulsar', label: 'Pulsar', category: 'messaging', colorVar: '--node-messaging-pulsar', icon: '🌟' },
  { type: 'eventbridge', label: 'EventBridge', category: 'messaging', colorVar: '--node-messaging-eventbridge', icon: '🌉' },

  // Monitoring
  { type: 'grafana', label: 'Grafana', category: 'monitoring', colorVar: '--node-monitoring-grafana', icon: '📊' },
  { type: 'prometheus', label: 'Prometheus', category: 'monitoring', colorVar: '--node-monitoring-prometheus', icon: '🔥' },
  { type: 'datadog', label: 'Datadog', category: 'monitoring', colorVar: '--node-monitoring-datadog', icon: '🐕' },
  { type: 'sentry', label: 'Sentry', category: 'monitoring', colorVar: '--node-monitoring-sentry', icon: '🛡' },
  { type: 'elk', label: 'ELK Stack', category: 'monitoring', colorVar: '--node-monitoring-elk', icon: '🦌' },
  { type: 'jaeger', label: 'Jaeger', category: 'monitoring', colorVar: '--node-monitoring-jaeger', icon: '🔭' },
  { type: 'pagerduty', label: 'PagerDuty', category: 'monitoring', colorVar: '--node-monitoring-pagerduty', icon: '🚨' },
  { type: 'newrelic', label: 'New Relic', category: 'monitoring', colorVar: '--node-monitoring-newrelic', icon: '📈' },

  // Auth / Identity
  { type: 'keycloak', label: 'Keycloak', category: 'auth', colorVar: '--node-auth-keycloak', icon: '🔑' },
  { type: 'auth0', label: 'Auth0', category: 'auth', colorVar: '--node-auth-auth0', icon: '🔒' },
  { type: 'okta', label: 'Okta', category: 'auth', colorVar: '--node-auth-okta', icon: '🛂' },
  { type: 'firebase-auth', label: 'Firebase Auth', category: 'auth', colorVar: '--node-auth-firebase', icon: '🔥' },
  { type: 'clerk', label: 'Clerk', category: 'auth', colorVar: '--node-auth-clerk', icon: '👤' },
  { type: 'supabase-auth', label: 'Supabase Auth', category: 'auth', colorVar: '--node-auth-supabase', icon: '⚡' },
];

export const EDGE_TYPES_CONFIG: { type: EdgeType; label: string; style: string }[] = [
  { type: 'rest', label: 'REST API', style: 'solid' },
  { type: 'websocket', label: 'WebSocket', style: 'dashed' },
  { type: 'webhook', label: 'Webhook', style: 'dotted' },
  { type: 'grpc', label: 'gRPC', style: 'solid' },
  { type: 'graphql', label: 'GraphQL', style: 'dashed' },
  { type: 'mqtt', label: 'MQTT', style: 'dotted' },
  { type: 'amqp', label: 'AMQP', style: 'dashed' },
];

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  datastore: 'Datastores',
  external: 'External',
  devops: 'DevOps / Infra',
  messaging: 'Messaging',
  monitoring: 'Monitoring',
  auth: 'Auth / Identity',
};
