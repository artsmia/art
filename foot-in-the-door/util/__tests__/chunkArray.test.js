/** @format */
import { chunkArray } from '..'

function buildIndexedArray(size) {
  return new Array(size).fill('').map((_, index) => index + 1)
}

describe('chunkArray divides an array into even groups', () => {
  test('when the array divides evenly', () => {
    const array4 = buildIndexedArray(4)

    const array4by2 = chunkArray(array4, 2)
    expect(array4by2).toContainEqual([1, 2])
    expect(array4by2).toContainEqual([3, 4])

    const array6by3 = chunkArray(buildIndexedArray(6), 3)
    expect(array6by3).toContainEqual([1, 2, 3])
    expect(array6by3).toContainEqual([4, 5, 6])
  })

  describe("and when it doesn't…", () => {
    test('5%2', () => {
      // This should definitely be [3, 4, 5] in the second chunk
      const array5by2 = chunkArray(buildIndexedArray(5), 2)
      expect(array5by2).toContainEqual([1, 2])
      expect(array5by2).toContainEqual([3, 4, 5])
    })

    test('8%3', () => {
      const a8by3 = chunkArray(buildIndexedArray(8), 3)
      expect(a8by3).toContainEqual([1, 2, 3])
      expect(a8by3).toContainEqual([4, 5])
      expect(a8by3).toContainEqual([6, 7, 8])
    })

    test('10%3', () => {
      const a10by3 = chunkArray(buildIndexedArray(10), 3)
      expect(a10by3).toContainEqual([1, 2, 3])
      expect(a10by3).toContainEqual([4, 5, 6])
      expect(a10by3).toContainEqual([7, 8, 9, 10])
      // or should this break into 2x2 instead of 1x4?
      // expect(a10by3).toContainEqual([7, 8])
      // expect(a10by3).toContainEqual([9, 10])
    })

    test('8%5', () => {
      // Should this balance into two chunks of 4?
      // …instead of a 5 and a 3?
      const a8by5 = chunkArray(buildIndexedArray(8), 5)
      expect(a8by5).toContainEqual(buildIndexedArray(4))
      expect(a8by5).toContainEqual([5, 6, 7, 8])
    })

    test('14%5', () => {
      const a14by5 = chunkArray(buildIndexedArray(14), 5)
      expect(a14by5).toContainEqual(buildIndexedArray(5))
      expect(a14by5).toContainEqual([6, 7, 8, 9])
      // …
      expect(a14by5).toContainEqual([10, 11, 12, 13, 14])
    })

    test('11%5', () => {
      const a11by5 = chunkArray(buildIndexedArray(11), 5)
      expect(a11by5).toContainEqual(buildIndexedArray(5))
      expect(a11by5).toContainEqual([6, 7, 8, 9, 10, 11])
    })
  })
})
