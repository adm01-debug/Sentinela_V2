import { Request, Response } from './types';
import { PluginHandler } from './gateway';

export class RequestTransformer implements PluginHandler {
  constructor(private transformations: RequestTransformation[]) {}
  
  async preRequest(req: Request): Promise<Request> {
    let transformed = { ...req, headers: { ...req.headers } };
    
    for (const t of this.transformations) {
      if (t.addHeader) transformed.headers[t.addHeader.name] = t.addHeader.value;
      if (t.removeHeader) delete transformed.headers[t.removeHeader];
      if (t.rewritePath) transformed.path = transformed.path.replace(new RegExp(t.rewritePath.from), t.rewritePath.to);
    }
    
    return transformed;
  }
}

export class ResponseTransformer implements PluginHandler {
  constructor(private transformations: ResponseTransformation[]) {}
  
  async postResponse(res: Response): Promise<Response> {
    let transformed = { ...res, headers: { ...res.headers } };
    
    for (const t of this.transformations) {
      if (t.addHeader) transformed.headers[t.addHeader.name] = t.addHeader.value;
      if (t.removeHeader) delete transformed.headers[t.removeHeader];
    }
    
    return transformed;
  }
}

export interface RequestTransformation { addHeader?: { name: string; value: string }; removeHeader?: string; rewritePath?: { from: string; to: string }; }
export interface ResponseTransformation { addHeader?: { name: string; value: string }; removeHeader?: string; }