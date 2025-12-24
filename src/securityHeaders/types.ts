export interface SecurityHeadersConfig { csp?: ContentSecurityPolicy; hsts?: HSTSConfig; xfo?: XFrameOptions; xcto?: boolean; xxss?: boolean; referrer?: ReferrerPolicy; permissions?: PermissionsPolicy; }
export interface ContentSecurityPolicy { defaultSrc: string[]; scriptSrc?: string[]; styleSrc?: string[]; imgSrc?: string[]; connectSrc?: string[]; reportUri?: string; }
export interface HSTSConfig { maxAge: number; includeSubDomains?: boolean; preload?: boolean; }
export type XFrameOptions = 'DENY' | 'SAMEORIGIN';
export type ReferrerPolicy = 'no-referrer' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin';
export interface PermissionsPolicy { geolocation?: string[]; camera?: string[]; microphone?: string[]; }