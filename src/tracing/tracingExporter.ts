import { Span } from './tracer';
export type ExporterType = 'console' | 'jaeger' | 'zipkin' | 'otlp';
export interface TracingExporter { export(spans: Span[]): Promise<void>; }
export class ConsoleExporter implements TracingExporter { async export(spans: Span[]): Promise<void> { spans.forEach(s => console.log('[TRACE]', s.name, s.endTime ? (s.endTime - s.startTime).toFixed(2) + 'ms' : 'ongoing')); } }
export class OTLPExporter implements TracingExporter { constructor(private endpoint: string) {} async export(spans: Span[]): Promise<void> { console.log('Exporting ' + spans.length + ' spans to ' + this.endpoint); } }
export const consoleExporter = new ConsoleExporter();
