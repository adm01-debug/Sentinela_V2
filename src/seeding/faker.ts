export class Faker {
  static string(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  
  static number(min: number = 0, max: number = 100): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
  static decimal(min: number = 0, max: number = 100, decimals: number = 2): number { return parseFloat((Math.random() * (max - min) + min).toFixed(decimals)); }
  static boolean(): boolean { return Math.random() > 0.5; }
  static date(from?: Date, to?: Date): Date {
    const start = from?.getTime() ?? Date.now() - 365 * 24 * 60 * 60 * 1000;
    const end = to?.getTime() ?? Date.now();
    return new Date(start + Math.random() * (end - start));
  }
  
  static email(): string { return this.string(8).toLowerCase() + '@' + this.string(5).toLowerCase() + '.com'; }
  static uuid(): string { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }); }
  static phone(): string { return '+1' + Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join(''); }
  static firstName(): string { const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana']; return names[Math.floor(Math.random() * names.length)]; }
  static lastName(): string { const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis']; return names[Math.floor(Math.random() * names.length)]; }
  static fullName(): string { return this.firstName() + ' ' + this.lastName(); }
  static company(): string { return this.lastName() + ' ' + ['Inc', 'LLC', 'Corp', 'Ltd'][Math.floor(Math.random() * 4)]; }
  static address(): string { return this.number(1, 9999) + ' ' + this.lastName() + ' ' + ['St', 'Ave', 'Blvd', 'Rd'][Math.floor(Math.random() * 4)]; }
  static city(): string { const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']; return cities[Math.floor(Math.random() * cities.length)]; }
  static country(): string { const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Brazil']; return countries[Math.floor(Math.random() * countries.length)]; }
  static pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
  static pickMany<T>(arr: T[], count: number): T[] { return [...arr].sort(() => Math.random() - 0.5).slice(0, count); }
}