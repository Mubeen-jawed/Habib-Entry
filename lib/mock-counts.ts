export type MockSectionCounts = {
  MATH: number;
  READING: number;
  WRITING: number;
};

export function pickMockCounts(): MockSectionCounts {
  const math = Math.random() < 0.5 ? 20 : 25;
  const readingIsHigh = Math.random() < 0.5;
  return {
    MATH: math,
    READING: readingIsHigh ? 25 : 20,
    WRITING: readingIsHigh ? 20 : 25,
  };
}

export function describeMockCounts(counts: MockSectionCounts): string {
  return `Full mock: ${counts.MATH} Math + ${counts.READING} Reading + ${counts.WRITING} Writing + Essay, 3.5 hours total.`;
}
