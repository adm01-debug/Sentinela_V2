import { create, transpose, multiply, identity } from '../../core/matrix';
describe('Matrix', () => {
  it('should create', () => { expect(create(2, 3, 0)).toEqual([[0, 0, 0], [0, 0, 0]]); });
  it('should transpose', () => { expect(transpose([[1, 2], [3, 4]])).toEqual([[1, 3], [2, 4]]); });
  it('should multiply', () => { expect(multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[19, 22], [43, 50]]); });
  it('should create identity', () => { expect(identity(2)).toEqual([[1, 0], [0, 1]]); });
});
