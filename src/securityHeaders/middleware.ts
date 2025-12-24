import { SecurityHeadersConfig } from './types';

export class SecurityHeadersMiddleware {
  constructor(private config: SecurityHeadersConfig) {}
  
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.config.csp) headers['Content-Security-Policy'] = this.buildCSP(this.config.csp);
    if (this.config.hsts) headers['Strict-Transport-Security'] = this.buildHSTS(this.config.hsts);
    if (this.config.xfo) headers['X-Frame-Options'] = this.config.xfo;
    if (this.config.xcto) headers['X-Content-Type-Options'] = 'nosniff';
    if (this.config.xxss) headers['X-XSS-Protection'] = '1; mode=block';
    if (this.config.referrer) headers['Referrer-Policy'] = this.config.referrer;
    if (this.config.permissions) headers['Permissions-Policy'] = this.buildPermissions(this.config.permissions);
    
    return headers;
  }
  
  private buildCSP(csp: SecurityHeadersConfig['csp']): string {
    if (!csp) return '';
    const directives: string[] = [];
    directives.push('default-src ' + csp.defaultSrc.join(' '));
    if (csp.scriptSrc) directives.push('script-src ' + csp.scriptSrc.join(' '));
    if (csp.styleSrc) directives.push('style-src ' + csp.styleSrc.join(' '));
    if (csp.imgSrc) directives.push('img-src ' + csp.imgSrc.join(' '));
    if (csp.connectSrc) directives.push('connect-src ' + csp.connectSrc.join(' '));
    if (csp.reportUri) directives.push('report-uri ' + csp.reportUri);
    return directives.join('; ');
  }
  
  private buildHSTS(hsts: SecurityHeadersConfig['hsts']): string {
    if (!hsts) return '';
    let value = 'max-age=' + hsts.maxAge;
    if (hsts.includeSubDomains) value += '; includeSubDomains';
    if (hsts.preload) value += '; preload';
    return value;
  }
  
  private buildPermissions(perms: SecurityHeadersConfig['permissions']): string {
    if (!perms) return '';
    const policies: string[] = [];
    if (perms.geolocation) policies.push('geolocation=(' + perms.geolocation.join(' ') + ')');
    if (perms.camera) policies.push('camera=(' + perms.camera.join(' ') + ')');
    if (perms.microphone) policies.push('microphone=(' + perms.microphone.join(' ') + ')');
    return policies.join(', ');
  }
}