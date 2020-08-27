/** @format */
var React = require('react')
var { Link } = require('react-router')

var InspiredByMiaDecorator = React.createClass({
  // displayName: 'Artwork Group',
  render() {
    // TODO dedupe logic for 'lifting' artworks with Audio decorator
    const term = this.props.term[0]
    const hits = this.props.hits

    const hitsWithInspired =
      hits && hits.filter((hit) => hit._source['related:inspiredByMia'])

    const showHitsWithInspired =
      hitsWithInspired && hitsWithInspired.length < 51

    // END TODO

    return (
      <div style={{ color: 'white', maxWidth: '100%' }}>
        <h3 style={{ display: 'inline', lineHeight: '24px' }}>
          Inspired By Mia
        </h3>
        <p style={{ display: 'inline' }}>
          : The artworks in this list are not part of Mia's collection, but were
          inspired by it. Our collection is here for you in person and online.
          An art museum has walls, but inspiration is limitless.{' '}
          {!showHitsWithInspired || (
            <Link
              to="searchResults"
              params={{ terms: `_exists_:"related:inspiredByMia"` }}
            >
              See all &rarr;
            </Link>
          )}
        </p>
        {showHitsWithInspired ? (
          <div style={{ overflow: 'scroll' }}>
            <InspiredArtworkScroll hits={hitsWithInspired} />
          </div>
        ) : (
          <p>
            How does Mia inspire you? Show us! Our collection is here for you in
            person and online.{' '}
            <a href="https://new.artsmia.org/art-artists/inspired-by-mia">
              #InspiredByMia
            </a>
            .
          </p>
        )}
      </div>
    )
  },
})

module.exports = InspiredByMiaDecorator

var InspiredArtworkScroll = React.createClass({
  render() {
    const { hits } = this.props
    const inspireds = hits
      .map(({ _source: s }) => {
        return s['related:inspiredByMia']
      })
      .flat()

    return (
      <div>
        {hits ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: '1em',
            }}
          >
            {inspireds.map((hit) => {
              return (
                <Link
                  to="sandboxArtwork"
                  params={{ id: hit.wpid }}
                  style={{
                    display: 'inline-block',
                    width: '9em',
                    margin: '0 0 0 1em',
                  }}
                >
                  <img src={hit.image} style={{ maxWidth: '7em' }} />
                  <br />
                  <strong>{hit.title}</strong>
                  <p>{hit.artist}</p>
                </Link>
              )
            })}
          </div>
        ) : (
          'no hits'
        )}
      </div>
    )
  },
})
