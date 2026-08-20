import { describe, expect, it } from 'vitest';
import {
  buildArticleQuery,
  countActiveFilters,
  DEFAULT_FILTERS,
  isCalendarDate,
  isDateRangeValid,
  parseFilters,
  serializeFilters,
  toLocalIsoDate,
} from '@/features/filters/searchParams';

describe('parseFilters', () => {
  it('reads every supported parameter', () => {
    const filters = parseFilters(
      new URLSearchParams(
        'q=  ai   chips &category=technology&from=2026-01-01&to=2026-02-01&source=guardian',
      ),
    );

    expect(filters).toEqual({
      search: 'ai chips',
      categories: ['technology'],
      from: '2026-01-01',
      to: '2026-02-01',
      sources: ['guardian'],
    });
  });

  it('reads multiple categories and drops unknown ones', () => {
    const filters = parseFilters(
      new URLSearchParams('category=sports&category=aliens&category=health,technology'),
    );

    expect(filters.categories).toEqual(['technology', 'health', 'sports']);
  });

  it('reads multiple sources and drops unknown ones', () => {
    const filters = parseFilters(
      new URLSearchParams('source=nyt&source=myspace&source=guardian,newsapi'),
    );

    expect(filters.sources).toEqual(['newsapi', 'guardian', 'nyt']);
  });

  it('drops values it does not recognize', () => {
    const filters = parseFilters(
      new URLSearchParams('category=aliens&from=yesterday&to=2026-13-45&source=myspace'),
    );

    expect(filters.categories).toEqual([]);
    expect(filters.from).toBe(null);
    expect(filters.to).toBe(null);
    expect(filters.sources).toEqual([]);
  });

  it('drops calendar dates that are not real days', () => {
    expect(parseFilters(new URLSearchParams('from=2026-02-31')).from).toBe(null);
    expect(isCalendarDate('2026-02-31')).toBe(false);
    expect(isCalendarDate('2026-02-01')).toBe(true);
  });

  it('returns defaults for an empty query string', () => {
    expect(parseFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });
});

describe('serializeFilters', () => {
  it('round-trips through parseFilters', () => {
    const filters = {
      search: 'climate',
      categories: ['science'],
      from: '2026-01-01',
      to: null,
      sources: ['guardian'],
    } as const;

    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });

  it('omits defaults so shared links stay short', () => {
    expect(serializeFilters(DEFAULT_FILTERS).toString()).toBe('');
  });

  it('writes each selected category as its own parameter', () => {
    expect(
      serializeFilters({ ...DEFAULT_FILTERS, categories: ['sports', 'health'] }).toString(),
    ).toBe('category=health&category=sports');
  });

  it('writes each selected source as its own parameter', () => {
    expect(
      serializeFilters({ ...DEFAULT_FILTERS, sources: ['nyt', 'guardian'] }).toString(),
    ).toBe('source=guardian&source=nyt');
  });
});

describe('date range validation', () => {
  it('rejects a "from" that is later than "to"', () => {
    expect(isDateRangeValid({ ...DEFAULT_FILTERS, from: '2026-02-01', to: '2026-01-01' })).toBe(
      false,
    );
    expect(isDateRangeValid({ ...DEFAULT_FILTERS, from: '2026-01-01', to: '2026-02-01' })).toBe(true);
    expect(isDateRangeValid({ ...DEFAULT_FILTERS, from: '2026-01-01' })).toBe(true);
  });

  it('uses the local calendar date rather than UTC', () => {
    expect(toLocalIsoDate(new Date(2026, 0, 9, 1, 0, 0))).toBe('2026-01-09');
  });
});

describe('buildArticleQuery', () => {
  it('uses the category filter instead of merging it with personalization', () => {
    const query = buildArticleQuery({
      filters: { ...DEFAULT_FILTERS, categories: ['sports'] },
      availableProviders: ['guardian', 'nyt'],
      extraCategories: ['health', 'sports'],
    });

    expect(query.categories).toEqual(['sports']);
  });

  it('keeps every selected category filter', () => {
    const query = buildArticleQuery({
      filters: { ...DEFAULT_FILTERS, categories: ['sports', 'health'] },
      availableProviders: ['guardian'],
      extraCategories: ['technology'],
    });

    expect(query.categories).toEqual(['health', 'sports']);
  });

  it('uses personalization categories when no category filter is set', () => {
    const query = buildArticleQuery({
      filters: DEFAULT_FILTERS,
      availableProviders: ['guardian'],
      extraCategories: ['health', 'sports'],
    });

    expect(query.categories).toEqual(['health', 'sports']);
  });

  it('uses the selected sources as the only providers', () => {
    expect(
      buildArticleQuery({
        filters: { ...DEFAULT_FILTERS, sources: ['guardian', 'nyt'] },
        availableProviders: ['newsapi', 'guardian', 'nyt'],
      }).providers,
    ).toEqual(['guardian', 'nyt']);
  });

  it('uses every available provider when no source is selected', () => {
    expect(
      buildArticleQuery({
        filters: DEFAULT_FILTERS,
        availableProviders: ['guardian'],
      }).providers,
    ).toEqual(['guardian']);
  });

  it('uses personalization sources when no source filter is set', () => {
    expect(
      buildArticleQuery({
        filters: DEFAULT_FILTERS,
        availableProviders: ['newsapi', 'guardian', 'nyt'],
        extraSources: ['guardian', 'nyt'],
      }).providers,
    ).toEqual(['guardian', 'nyt']);
  });

  it('intersects the source filter with personalization sources', () => {
    expect(
      buildArticleQuery({
        filters: { ...DEFAULT_FILTERS, sources: ['nyt', 'newsapi'] },
        availableProviders: ['newsapi', 'guardian', 'nyt'],
        extraSources: ['guardian', 'nyt'],
      }).providers,
    ).toEqual(['nyt']);
  });

  it('returns no providers when the source filter misses personalization sources', () => {
    expect(
      buildArticleQuery({
        filters: { ...DEFAULT_FILTERS, sources: ['newsapi'] },
        availableProviders: ['newsapi', 'guardian', 'nyt'],
        extraSources: ['guardian'],
      }).providers,
    ).toEqual([]);
  });

  it('ignores a source that is not available instead of fetching nothing', () => {
    expect(
      buildArticleQuery({
        filters: { ...DEFAULT_FILTERS, sources: ['nyt'] },
        availableProviders: ['guardian'],
      }).providers,
    ).toEqual(['guardian']);
  });

  it('keeps available sources from the filter and drops unavailable ones', () => {
    expect(
      buildArticleQuery({
        filters: { ...DEFAULT_FILTERS, sources: ['nyt', 'guardian'] },
        availableProviders: ['guardian'],
      }).providers,
    ).toEqual(['guardian']);
  });

  it('ignores an impossible date range instead of returning nothing', () => {
    const query = buildArticleQuery({
      filters: { ...DEFAULT_FILTERS, from: '2026-02-01', to: '2026-01-01' },
      availableProviders: ['guardian'],
    });

    expect(query.from).toBe(null);
    expect(query.to).toBe(null);
  });
});

describe('countActiveFilters', () => {
  it('counts server and client filters but not the search term', () => {
    expect(
      countActiveFilters({
        ...DEFAULT_FILTERS,
        search: 'ai',
        categories: ['technology'],
        sources: ['guardian'],
      }),
    ).toBe(2);
  });
});
