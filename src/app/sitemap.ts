import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://fds.devbrew.dev/',
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
