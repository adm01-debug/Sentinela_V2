// screenshot-desktop ships no type declarations; provide a minimal ambient
// module so the agent type-checks. The runtime API returns an image Buffer.
declare module "screenshot-desktop" {
  interface ScreenshotOptions {
    screen?: number | string;
    format?: "png" | "jpg";
    filename?: string;
  }
  function screenshot(options?: ScreenshotOptions): Promise<Buffer>;
  namespace screenshot {
    function listDisplays(): Promise<Array<{ id: number | string; name: string }>>;
  }
  export = screenshot;
}
