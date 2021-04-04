import { unionBy, uniqBy, uniqWith } from 'lodash';

export function mergeArrayOfObjectsBy<T, K extends keyof T>(
  aArray: T[],
  bArray: T[],
  property: K,
  sortProperty?: K,
): T[] {
  if (typeof sortProperty === 'undefined') {
    return unionBy(aArray, bArray, property);
  }

  let allArray = [...aArray, ...bArray];

  if (sortProperty) {
    allArray = sortObjectArrayBy([...aArray, ...bArray], sortProperty);
  }

  return uniqBy(allArray, property);
}

export function mergeArrayOfObjectsWith<T, K extends keyof T>(
  aArray: T[],
  bArray: T[],
  comparatorFn: (a: T, b: T) => boolean,
  sortProperty?: K,
): T[] {
  let allArray = [...aArray, ...bArray];

  if (sortProperty) {
    allArray = sortObjectArrayBy(allArray, sortProperty);
  }

  return uniqWith(allArray, comparatorFn);
}

function sortObjectArrayBy<T, K extends keyof T>(arr: T[], sortProperty: K): T[] {
  return arr.sort((a, b) => (b[sortProperty] as any) - (a[sortProperty] as any));
}
