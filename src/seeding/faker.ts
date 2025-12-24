export class Faker {
  static string(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  
  static number(min: number = 0, max: number = 1000): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
  static boolean(): boolean { return Math.random() > 0.5; }
  static date(start?: Date, end?: Date): Date {
    const s = start?.getTime() ?? Date.now() - 365 * 24 * 60 * 60 * 1000;
    const e = end?.getTime() ?? Date.now();
    return new Date(s + Math.random() * (e - s));
  }
  
  static email(): string { return this.string(8).toLowerCase() + '@' + this.string(5).toLowerCase() + '.com'; }
  static uuid(): string { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }); }
  static phone(): string { return '+1' + Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join(''); }
  
  static firstName(): string { const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana']; return names[Math.floor(Math.random() * names.length)]; }
  static lastName(): string { const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']; return names[Math.floor(Math.random() * names.length)]; }
  static fullName(): string { return this.firstName() + ' ' + this.lastName(); }
  
  static pick<T>(array: T[]): T { return array[Math.floor(Math.random() * array.length)]; }
  static shuffle<T>(array: T[]): T[] { return [...array].sort(() => Math.random() - 0.5); }
}