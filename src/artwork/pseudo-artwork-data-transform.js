/** @format */
function inspiredByMia(originalData) {
  console.info(originalData)
  const {
    id,
    acf: { artwork_title: title, medium },
    date: dateString,
    content,
    title: { rendered: artist },
    better_featured_image: { source_url: image_url },
  } = originalData

  return {
    id,
    title,
    medium,
    classification: 'Inspired By Mia',
    // dimension: undefined,
    object_name: 'Inspired By Mia',
    // continent: null,
    // country: null,
    // culture: null,
    dated: dateString.split('-')[0],
    room: '(Online Exhibition)',
    // style: '19th century',
    // inscription: 'Signature',
    // signed: 'LR in black: [C. Monet]',
    // markings: '',
    text: content.rendered,
    // description: 'Impressionist. Landscape with coast.',
    // creditline: 'Gift of Mr. and Mrs. Theodore Bennett',
    accession_number: 'INSPIRED BY MIA',
    artist: artist,
    role: 'Artist',
    // nationality: 'French',
    // life_date: 'French, 1840 - 1926',
    image_copyright: `© ${artist}`,
    department: 'Museum Engagement',
    rights_type: 'In Copyright',
    image: 'valid',
    // image_width: 6793,
    // image_height: 3794,
    image_url: image_url,
    restricted: 1,
    public_access: '1',
    curator_approved: 0,
    'related:exhibitions': [
      {
        id: 'Inspired By Mia',
        title: 'Inspired By Mia',
        description: null,
        type: 'exhibition', // showcase?
        date: 'Ongoing',
      },
    ],
    pseudoArtwork: originalData,
  }
}

module.exports = inspiredByMia
