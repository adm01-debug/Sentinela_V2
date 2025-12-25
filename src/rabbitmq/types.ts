/**
 * @fileoverview RabbitMQ types
 * @module @sentinela/core/rabbitmq
 * @version 13.0.0
 */

export interface RabbitConfig { url: string; heartbeat?: number; prefetch?: number; }
export interface QueueOptions { durable?: boolean; exclusive?: boolean; autoDelete?: boolean; arguments?: Record<string, unknown>; }
export interface ExchangeOptions { type: 'direct' | 'topic' | 'fanout' | 'headers'; durable?: boolean; autoDelete?: boolean; }
export interface PublishOptions { persistent?: boolean; expiration?: string; priority?: number; headers?: Record<string, unknown>; }
export interface ConsumeOptions { noAck?: boolean; exclusive?: boolean; priority?: number; }