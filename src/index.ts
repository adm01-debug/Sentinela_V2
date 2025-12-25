/**
 * @fileoverview Main entry point for Sentinela
 * @module @sentinela/core
 * @version 13.0.0
 */

// Core utilities
export * from './core';

// Architecture patterns
export * from './cqrsAdvanced';
export * from './sagaOrchestration';
export * from './outboxPattern';
export * from './specification';
export * from './unitOfWork';
export * from './repository';
export * from './aggregate';
export * from './domainEvents';
export * from './antiCorruptionLayer';
export * from './eventSourcing';

// Messaging
export * from './kafka';
export * from './rabbitmq';

// Resilience
export * from './bulkhead';
export * from './backpressure';

// Database
export * from './sharding';
export * from './connectionPool';
export * from './partitioning';
export * from './queryBuilder';
export * from './replication';

// Security
export * from './siem';
export * from './dlp';
export * from './encryptionAtRest';
export * from './keyManagement';
export * from './tokenization';
export * from './securityScanner';
export * from './threatModeling';
export * from './securityHeaders';
export * from './rbac';

// Cloud Native
export * from './configServer';
export * from './serviceMesh';
export * from './serviceDiscovery';
export * from './sidecar';

// AI/ML
export * from './mlPipeline';
export * from './featureStore';
export * from './modelRegistry';
export * from './modelServing';
export * from './abTesting';

// Observability
export * from './logAggregation';
export * from './distributedTracing';
export * from './metricsCollection';
export * from './healthChecksAdvanced';
export * from './alerting';
export * from './dashboard';

// DevOps
export * from './cicd';
export * from './gitops';
export * from './iac';
export * from './secretManagement';

// Container
export * from './containerOrchestration';
export * from './imageRegistry';
export * from './networkPolicy';
export * from './serviceCatalog';

// Kubernetes
export * from './hpa';
export * from './vpa';
export * from './clusterAutoscaler';
export * from './podDisruptionBudget';
export * from './resourceQuotas';
export * from './limitRanges';
export * from './priorityClasses';
export * from './nodeAffinity';
export * from './podAffinity';
export * from './taintsTolerations';
export * from './customResources';
export * from './operators';
export * from './admissionControllers';
export * from './ingressController';

// Workloads
export * from './statefulSets';
export * from './daemonSets';
export * from './jobsCronJobs';

// Security Policies
export * from './podSecurityPolicies';
export * from './networkPoliciesAdvanced';
export * from './serviceAccounts';
export * from './namespaceManagement';

// Enterprise
export * from './multiTenancy';
export * from './apiGateway';

// Performance
export * from './cdn';
export * from './edgeComputing';
