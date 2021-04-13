import { mergeArrayOfObjectsBy, mergeArrayOfObjectsWith } from '../utils/mergeArrayOfObject';

describe('mergeArrayOfObject utils test', () => {
  test('mergeBy', () => {
    const a = [{ id: '1' }, { id: '2' }];
    const b = [{ id: '1' }];

    const result = mergeArrayOfObjectsBy(a, b, 'id');

    expect(result.length).toBe(2);
  });

  test('mergeBy with a sort property argument', () => {
    const a = [
      { id: '1', time: 1 },
      { id: '2', time: 1 },
    ];
    const b = [{ id: '1', time: 2 }];

    const result = mergeArrayOfObjectsBy(a, b, 'id', 'time');

    expect(result).toEqual([
      { id: '1', time: 2 },
      { id: '2', time: 1 },
    ]);
  });

  test('mergeWith', () => {
    const a = [
      { id: '1', time: 1 },
      { id: '2', time: 1 },
    ];
    const b = [{ id: '1', time: 2 }];

    const result = mergeArrayOfObjectsWith(a, b, (a, b) => a.id === b.id);

    expect(result.length).toBe(2);
  });

  test('mergeWith with a sort property argument', () => {
    const a = [
      { id: '1', time: 1 },
      { id: '2', time: 1 },
    ];
    const b = [{ id: '1', time: 2 }];

    const result = mergeArrayOfObjectsWith(a, b, (a, b) => a.id === b.id, 'time');

    expect(result).toEqual([
      { id: '1', time: 2 },
      { id: '2', time: 1 },
    ]);
  });
});
