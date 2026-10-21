var React = require("react");
var rest = require("rest");
var Helmet = require("react-helmet");
var { Link } = require("react-router");
var imageCDN = require("./image-cdn");

var SEARCH = require("./endpoints").search;

var ARTWORK_IDS = [
    827,
    1822,
    14148,
    1278,
    99386,
    114440,
    2543,
    790,
    4324,
    4483,
    98653,
];

var OneStrangeNight = React.createClass({
  statics: {
    fetchData: {
      artworks: () => {
        var searchUrl = `${SEARCH}/ids/${ARTWORK_IDS.join(",")}`;

        return rest(searchUrl)
          .then((r) => JSON.parse(r.entity))
          .then((json) => {
            var artworks = json.hits.hits
            .filter((hit) => hit.found && hit._source)
            .map((hit) => hit._source);

            return ARTWORK_IDS
            .map((id) => artworks.find((art) => String(art.id) === String(id)))
            .filter(Boolean);
          });
      },
    },
  },

  render() {
    var artworks = this.props.data.artworks || [];

    return (
      <div>
        <div className="header-image"></div>
        <main className="one-strange-night">
          <OneStrangeNightHero />
          <OneStrangeNightBook />
          <section className="one-strange-night-artworks">
            {artworks.map((art) => (
              <ArtworkCard key={art.id} art={art} />
            ))}
          </section>

          <Helmet title="One Strange Night at Mia" />
        </main>
      </div>

    );
  },
});

var ArtworkCard = React.createClass({
  render() {
    var art = this.props.art;

    return (
      <article className="osn-artwork">
        <a
          className="osn-artwork-link"
          href={"/art/" + art.id}
          aria-label={"View " + art.title + " in Mia's collection"}
        >
          <h3 className="osn-artwork-title">
            {art.title}
          </h3>

          <div className="osn-artwork-image">
            <img
              src={imageCDN(art, 800)}
              alt={art.title}
              loading="lazy"
            />
          </div>

          <div className="osn-artwork-caption">
            <ArtworkMetadata art={art} />
          </div>
        </a>
      </article>
    );
  }
});

var ArtworkMetadata = React.createClass({
  render() {
    var { art } = this.props;

    var description = [
      art.artist,
      art.life_date,
      art.dated,
      art.medium,
    ].filter(Boolean).join(", ");

    var credit = [
      art.creditline,
      art.accession_number,
    ].filter(Boolean).join(" ");

    return (
      <p className="one-strange-night-artwork-metadata">
        {description}
        {description && credit ? ". " : ""}
        {credit}
      </p>
    );
  },
});

var OneStrangeNightHero = React.createClass({
  render() {
    return (
      <section className="one-strange-night-hero">
        <div className="one-strange-night-hero-image">
          <img
            src="/images/one-strange-night/hero.jpg"
            alt="Children viewing an owl-shaped vessel at Mia"
          />
        </div>

        <div className="one-strange-night-hero-content">
          <h1>The Art Behind the Adventure</h1>

          <p className="osn-hero-intro">
            The Pillsbury Owl’s adventure began with a single coloring
            page, but soon took on a life of its own.
          </p>

          <p>
            Inspired by Art Adventure, Mia’s program that introduces
            K–6 students to remarkable works of art through looking,
            wondering, and conversation, one coloring page grew into
            a collection featuring favorites from across the museum.
          </p>

          <p>
            Then the Owl took off. Those artworks became the characters,
            places, and surprises of <em>One Strange Night at Mia</em>,
            a coloring adventure through the museum. Meet the original
            works below—and see where the story began.
          </p>

          <a
            className="osn-hero-link"
            href="https://new.artsmia.org/programs/teachers-and-students/art-adventure"
          >
            Learn more about Art Adventure →
          </a>
        </div>
      </section>
    );
  }
});

var OneStrangeNightBook = React.createClass({
  render() {
    return (
      <section className="one-strange-night-book">
        <div className="one-strange-night-book-image">
          <img
            src="/images/one-strange-night/book-cover.jpg"
            alt="One Strange Night at Mia book cover"
          />
        </div>

        <div className="one-strange-night-book-content">
          <h2>Get the One Strange Night at Mia</h2>

          <div className="one-strange-night-book-actions">
            <p>The adventure doesn’t have to end at the museum. One Strange Night at Mia brings artworks from Mia’s collection to life through coloring, creativity, and a little imagination. Download the full coloring book for free, or order a printed copy on Amazon.</p>
            <a
              href="https://images.artsmia.org/wp-content/uploads/2026/10/06132145/one_strange_night_at_mia_coloring_book.pdf"
              className="osn-book-button"
              download
            >
              Start Coloring for free
            </a>
            <a className="osn-secondary-button" href="https://shop.artsmia.org/products/one-strange-night-at-mia-a-coloring-adventure">
              Buy from The Store at Mia ↗
            </a>
          </div>
        </div>
      </section>
    );
  }
});

module.exports = OneStrangeNight;