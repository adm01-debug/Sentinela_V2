import { Panel } from './types';

export class GraphWidget {
  static create(title: string, query: string, pos: Panel['gridPos']): Panel {
    return { id: Date.now().toString(), type: 'graph', title, gridPos: pos, config: { query, legend: true, tooltip: true } };
  }
}

export class StatWidget {
  static create(title: string, query: string, pos: Panel['gridPos']): Panel {
    return { id: Date.now().toString(), type: 'stat', title, gridPos: pos, config: { query, unit: '', colorMode: 'value' } };
  }
}

export class TableWidget {
  static create(title: string, query: string, columns: string[], pos: Panel['gridPos']): Panel {
    return { id: Date.now().toString(), type: 'table', title, gridPos: pos, config: { query, columns, pagination: true } };
  }
}

export class GaugeWidget {
  static create(title: string, query: string, min: number, max: number, pos: Panel['gridPos']): Panel {
    return { id: Date.now().toString(), type: 'gauge', title, gridPos: pos, config: { query, min, max, thresholds: [] } };
  }
}