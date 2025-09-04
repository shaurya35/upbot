module.exports = {
  siteUrl: 'https://upbot.space',
  generateRobotsTxt: false, // We have a custom robots.txt
  outDir: './public',
  sourceDir: 'src/app',
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  generateIndexSitemap: false,
  exclude: [
    '/api/*',
    '/dashboard/*',
    '/profile/*',
    '/settings/*',
    '/admin/*',
    '/_next/*'
  ],
  additionalPaths: async (config) => [
    await config.transform({
      loc: '/',
      changefreq: 'daily',
      priority: 1.0,
      lastmod: new Date().toISOString(),
    }),
    await config.transform({
      loc: '/features',
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }),
    await config.transform({
      loc: '/pricing',
      changefreq: 'weekly', 
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }),
  ],
};
