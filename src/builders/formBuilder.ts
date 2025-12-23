interface FormField { name: string; type: string; label: string; required?: boolean; placeholder?: string; options?: { value: string; label: string }[]; validation?: (v: any) => string | null; }
export class FormBuilder {
  private fields: FormField[] = [];
  text(name: string, label: string, opts?: Partial<FormField>) { this.fields.push({ name, label, type: 'text', ...opts }); return this; }
  email(name: string, label: string, opts?: Partial<FormField>) { this.fields.push({ name, label, type: 'email', ...opts }); return this; }
  password(name: string, label: string, opts?: Partial<FormField>) { this.fields.push({ name, label, type: 'password', ...opts }); return this; }
  select(name: string, label: string, options: { value: string; label: string }[], opts?: Partial<FormField>) { this.fields.push({ name, label, type: 'select', options, ...opts }); return this; }
  checkbox(name: string, label: string, opts?: Partial<FormField>) { this.fields.push({ name, label, type: 'checkbox', ...opts }); return this; }
  textarea(name: string, label: string, opts?: Partial<FormField>) { this.fields.push({ name, label, type: 'textarea', ...opts }); return this; }
  build() { return this.fields; }
}
