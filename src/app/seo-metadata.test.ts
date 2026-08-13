import { describe, expect, it } from 'vitest';
import { metadata as homeMetadata } from '@/app/page';
import { metadata as impressumMetadata } from '@/app/impressum/page';
import { metadata as datenschutzMetadata } from '@/app/datenschutz/page';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

const SITE_URL = 'https://fds.devbrew.dev/';

describe('SEO metadata routes', () => {
  it.each([
    ['Impressum', impressumMetadata],
    ['Datenschutz', datenschutzMetadata],
  ])('marks %s as noindex,follow', (_label, metadata) => {
    expect(metadata?.robots).toMatchObject({
      index: false,
      follow: true,
    });
  });

  it('keeps the homepage indexable with a self-referencing canonical', () => {
    expect(homeMetadata.robots).toMatchObject({
      index: true,
      follow: true,
    });
    expect(homeMetadata.alternates?.canonical).toBe(SITE_URL);
    expect(homeMetadata.title).toBeTruthy();
    expect(homeMetadata.description).toBeTruthy();
  });

  it('allows the public application and advertises the sitemap', () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
      },
      sitemap: `${SITE_URL}sitemap.xml`,
    });
  });

  it('publishes only the canonical homepage in the sitemap', () => {
    const entries = sitemap();

    expect(entries).toEqual([
      {
        url: SITE_URL,
        changeFrequency: 'daily',
        priority: 1,
      },
    ]);

    const urls = entries.map((entry) => entry.url);
    expect(urls).not.toContain(`${SITE_URL}impressum`);
    expect(urls).not.toContain(`${SITE_URL}datenschutz`);
    expect(urls.some((url) => /\/(login|account|admin|api)(\/|$)/.test(url))).toBe(false);
  });
});
