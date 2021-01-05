module.exports = {
  // TODO these re-writes are causing routing problems?
  // I think they interfere with `basePath`?
  // leave them commented out for now
  async rewrites() {
    return [
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
}
