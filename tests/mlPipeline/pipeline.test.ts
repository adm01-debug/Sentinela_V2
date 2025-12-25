import { MLPipeline } from '../../mlPipeline';
describe('MLPipeline', () => {
  it('should execute pipeline steps', async () => {
    const pipeline = new MLPipeline();
    pipeline.add({ name: 'normalize', transform: async (d: any) => d.map((x: number) => x / 100) });
    pipeline.add({ name: 'double', transform: async (d: any) => d.map((x: number) => x * 2) });
    const result = await pipeline.execute([50, 100]);
    expect(result).toEqual([1, 2]);
  });
});
