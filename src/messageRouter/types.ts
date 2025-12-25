/**
 * @fileoverview Message router types
 * @module @sentinela/core/messageRouter
 * @version 13.0.0
 */

export interface Message { id: string; type: string; payload: unknown; headers: Record<string, string>; }
export interface Route { pattern: string | RegExp; destination: string; transform?: (msg: Message) => Message; }
export interface RoutingResult { destination: string; message: Message; matched: boolean; }