export interface SharedKernel {
  name: string;
  types: Map<string, unknown>;
  events: string[];
}

export class SharedKernelRegistry {
  private kernels: Map<string, SharedKernel> = new Map();
  
  register(kernel: SharedKernel): this { this.kernels.set(kernel.name, kernel); return this; }
  get(name: string): SharedKernel | undefined { return this.kernels.get(name); }
  getAll(): SharedKernel[] { return Array.from(this.kernels.values()); }
}

export class TypeExporter {
  static exportTypes(kernel: SharedKernel): string {
    let output = '// Shared Kernel: ' + kernel.name + '\n\n';
    kernel.types.forEach((type, name) => {
      output += 'export type ' + name + ' = ' + JSON.stringify(type) + ';\n';
    });
    return output;
  }
}