import { APIGateway, Route, Request, Response } from './types';

export class Gateway {
  private routes: Route[] = [];
  private plugins: Map<string, PluginHandler> = new Map();
  
  configure(config: APIGateway): void { this.routes = config.routes; }
  
  registerPlugin(name: string, handler: PluginHandler): void { this.plugins.set(name, handler); }
  
  async handle(request: Request): Promise<Response> {
    const route = this.matchRoute(request);
    if (!route) return { status: 404, headers: {}, body: { error: 'Not found' } };
    
    let req = request;
    for (const pluginName of route.plugins ?? []) {
      const plugin = this.plugins.get(pluginName);
      if (plugin?.preRequest) req = await plugin.preRequest(req);
    }
    
    let response = await this.forward(req, route);
    
    for (const pluginName of route.plugins ?? []) {
      const plugin = this.plugins.get(pluginName);
      if (plugin?.postResponse) response = await plugin.postResponse(response);
    }
    
    return response;
  }
  
  private matchRoute(request: Request): Route | undefined {
    return this.routes.find(r => request.path.startsWith(r.path) && r.methods.includes(request.method));
  }
  
  private async forward(request: Request, route: Route): Promise<Response> {
    console.log('Forwarding to', route.upstream.service + ':' + route.upstream.port);
    return { status: 200, headers: {}, body: { forwarded: true } };
  }
}

export interface PluginHandler { preRequest?: (req: Request) => Promise<Request>; postResponse?: (res: Response) => Promise<Response>; }