// SENTINELA V13 - 100 Enterprise Patterns
// Framework Enterprise Completo para TypeScript/Node.js

// CAT 1: Arquitetura (1-15)
export * from './cqrsAdvanced';
export * from './sagaOrchestration';
export * from './outboxPattern';
export * from './specification';
export * from './unitOfWork';
export * from './repository';
export * from './aggregate';
export * from './domainEvents';
export * from './antiCorruptionLayer';
export * from './boundedContext';
export * from './serviceDiscovery';
export * from './serviceMesh';
export * from './sidecar';
export * from './ambassador';
export * from './strangler';

// CAT 2: Cloud Native (16-20)
export * from './bulkhead';
export * from './backpressure';
export * from './serviceRegistry';
export * from './configServer';
export * from './apiComposition';

// CAT 3: Messaging (21-30)
export * from './kafka';
export * from './rabbitmq';
export * from './eventSourcing';
export * from './cdc';
export * from './streamProcessing';
export * from './messageReplay';
export * from './deadLetter';
export * from './eventStoreDb';
export * from './messageRouter';
export * from './messageBroker';

// CAT 4: Database (31-40)
export * from './sharding';
export * from './partitioning';
export * from './readReplica';
export * from './connectionPool';
export * from './queryOptimizer';
export * from './queryBuilder';
export * from './migrations';
export * from './seeding';
export * from './multiDatabase';
export * from './nosql';

// CAT 5: Security (41-50)
export * from './siem';
export * from './dlp';
export * from './encryptionAtRest';
export * from './keyManagement';
export * from './tokenization';
export * from './securityScanner';
export * from './threatModeling';
export * from './securityHeaders';
export * from './csrfAdvanced';
export * from './xssAdvanced';

// CAT 6: Performance (51-55)
export * from './cdn';
export * from './edgeComputing';
export * from './preloading';
export * from './prefetching';
export * from './lazyHydration';

// CAT 7: AI/ML (56-60)
export * from './mlPipeline';
export * from './featureStore';
export * from './modelRegistry';
export * from './modelServing';
export * from './abTesting';

// CAT 8: Observability (61-65)
export * from './logAggregation';
export * from './distributedTracing';
export * from './metricsCollection';
export * from './healthChecksAdvanced';
export * from './alerting';

// CAT 9: DevOps (66-70)
export * from './dashboard';
export * from './cicd';
export * from './gitops';
export * from './iac';
export * from './secretManagement';

// CAT 10: Container (71-75)
export * from './containerOrchestration';
export * from './imageRegistry';
export * from './networkPolicy';
export * from './serviceCatalog';
export * from './podDisruptionBudget';

// CAT 11: Kubernetes (76-85)
export * from './resourceQuotas';
export * from './limitRanges';
export * from './priorityClasses';
export * from './nodeAffinity';
export * from './podAffinity';
export * from './taintsTolerations';
export * from './customResources';
export * from './operators';
export * from './admissionControllers';
export * from './configMapsSecrets';

// CAT 12: Workloads (86-90)
export * from './ingressController';
export * from './serviceMeshAdvanced';
export * from './statefulSets';
export * from './daemonSets';
export * from './jobsCronJobs';

// CAT 13: Autoscaling (91-95)
export * from './hpa';
export * from './vpa';
export * from './clusterAutoscaler';
export * from './podSecurityPolicies';
export * from './rbac';

// CAT 14: Enterprise (96-100)
export * from './serviceAccounts';
export * from './networkPoliciesAdvanced';
export * from './namespaceManagement';
export * from './multiTenancy';
export * from './apiGateway';

// Version
export const VERSION = '13.0.0';
export const MODULES_COUNT = 100;
