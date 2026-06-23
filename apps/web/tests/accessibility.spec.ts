import { describe, expect, it } from 'vitest';
import { courseData } from '@inside/content';

describe('web accessibility contracts', () => {
  it('has reader-facing module titles for navigation landmarks', () => {
    expect(courseData.modules.every((module) => module.title.length > 5)).toBe(true);
  });
});
