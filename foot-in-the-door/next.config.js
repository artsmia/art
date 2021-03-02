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
    // Redirect away to top-level new.artsmia.org interior pages
    return 'stories visit programs join-and-invest about shop'
    .split(' ')
    .map(section => {
      return {
        source: `/${section}/:params*`,
        destination: `https://new.artsmia.org/${section}/:params*`,
        permanent: true,
      }
    })
  },
}
