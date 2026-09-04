
if (!process.env.SEARCH_ORIGIN) {
  throw new Error('Missing env var SEARCH_ORIGIN');
}

module.exports = {
  // TODO these re-writes are causing routing problems?
  // I think they interfere with `basePath`?
  // leave them commented out for now
  async rewrites() {
    return [
      {
        source: '/art-artists/:path*',
        destination: 'https://new.artsmia.org/art-artists/:path*',
        // permanent: false,
      },
      // {
      //   source: '/:path*',
      //   destination: '/:path*',
      //   // permanent: false,
      // },
      // {
      //   source: '/',
      //   destination: 'https://collections.artsmia.org/',
      //   basePath: false,
      //   // permanent: false,
      // },
      // {
      //   source: '/:path*',
      //   destination: 'https://collections.artsmia.org/:path*',
      //   basePath: false,
      //   // permanent: false,
      // },
    ]
  },
  async redirects() {
    const collectionRedirects = [
      {
        source: '/exhibitions/2898/creativity-academy-2021/room/all',
        destination: 'https://collections.artsmia.org/ ',
        permanent: true,
      },
    ]

    const mainSiteRedirects = 'stories visit programs join-and-invest about shop'
      .split(' ')
      .map(section => ({
        source: `/${section}/:params*`,
        destination: `https://new.artsmia.org/${section}/:params*`,
        permanent: true,
      }))

    return [
      ...collectionRedirects,
      ...mainSiteRedirects,
    ]
  },
}
