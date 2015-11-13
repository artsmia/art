var React = require('react')
var {Link} = require('react-router')

var Markdown = require('../markdown')
var findDepartment = require('../department-slug')

var DepartmentDecorator = React.createClass({
  getInitialState() {
    var [deptName, selector, slug] = this.getNameAndSelector(this.props.department)
    var {departmentInfo} = this.props
    var info = departmentInfo && departmentInfo.departments[selector]

    return {
      deptName,
      selector,
      slug,
      info: info,
      blurb: info && info.content || DepartmentContent[selector] || `Sorry, there's no "${deptName}" department.`,
      expanded: this.props.expanded || !!this.props.params.dept || false,
    }
  },

  render() {
    var {department} = this.props
    var {deptName, selector, blurb, expanded} = this.state

    var [blurbA, blurbB] = blurb.split('<hr />')

    var fullInfo = expanded && this.getFullInfo(blurbB)

    return <div className="departmentBlurb mdl-grid decorator d-department">
      <h2><Link to='department' params={{dept: this.state.slug, terms: department}}><span className="d-visit">Visit </span>{this.state.deptName}</Link></h2>
      <div className="mdl-cell mdl-cell--6-col departmentContent">{expanded ? <Markdown alreadyRendered={true}>{blurbA}</Markdown> : this.shortBlurb()}
      <p>Mia’s Affinity Groups are a great way for museum members to connect more closely with special areas of art interest, allowing you to delve deeper into the curatorial area of your choice.</p>
      <a href="http://new.artsmia.org/join-and-invest/affinity-groups/" className="button">Learn More</a>
      </div>
      {expanded && fullInfo}
    </div>
  },

  getNameAndSelector(term) {
    var decodedTerm = decodeURIComponent(term)
    var deptName = findDepartment(decodedTerm) ? decodedTerm : decodedTerm.match(/department:"?([^"]*)"?/)[1]
    return findDepartment(deptName)
  },

  shortBlurb() {
    return <div>
      <Markdown>{this.state.blurb.split('\n')[0]}</Markdown>
    </div>
  },

  getFullInfo(info) {
    var {deptName} = this.state

    return <div className="departmentResources mdl-cell mdl-cell--6-col">
      <div>{this.getCurators()}</div>
      <Markdown alreadyRendered={true}>{info}</Markdown>
    </div>
  },

  getCurators() {
    var curators = this.state.info.curators
    .map(name => this.props.departmentInfo.curators[name])
    .filter(exists => !!exists)
    .filter(({emeritus}) => !emeritus)

    return curators.length > 0 && <div id="curators">
      <h3>Curators</h3>
      {curators.map(curator => {
        return <div className="curatorBio" key={curator.slug}>
          <div className="curatorPic">
            <img src={curator.photo} />
          </div>
          <div className="curator-intro">
          <h4>{curator.name}</h4>
          <h5><Markdown>{curator.title}</Markdown></h5>
          </div>
        </div>
      })}
    </div>
  },

  getAffinity() {
    var affinities = this.props.departmentInfo.affinityGroups
    .filter(ag => ag.departments && ag.departments.indexOf(findDepartment(this.props.department)[1]) > -1)

    return affinities.map(a => {
      var image = <img src={a.featuredArt ? `http://api.artsMia.org/images/${a.featuredArt}/400/medium.jpg` : a.image} />
      image = a.featuredArt ? <Link to="artwork" params={{id: a.featuredArt}}>{image}</Link> : image

      return <div className="affinity" key={a.title}>
        <h3>{a.title}</h3>
        <div className="affinityImage">{image}</div>
        <div className="affinity-intro">
        <Markdown alreadyRendered={true}>{a.content}</Markdown>
          <p>Mia’s Affinity Groups are a great way for museum members to connect more closely with special areas of art interest, allowing you to delve deeper into the curatorial area of your choice.</p>
          <a href="http://new.artsmia.org/join-and-invest/affinity-groups/" className="button">Learn More</a>
        </div>
      </div>
    })
  },
})

var DepartmentContent = {
  africa: `The Arts of Africa and the Americas Department is dedicated to the immense creativity of Native peoples across the world, from prehistory to the present. The collection has grown significantly since the department was founded more than thirty years ago, and now numbers more than 3,000 objects, including masterworks of sculpture, ceramics, metalsmithing, painting, basketry, and bead-, shell-, and quillwork, reflecting the diversity of these regions and cultures.\r\n\r\nHighlights of African art at the museum include a ceramic portrait head from the ancient civilization of Ife, a thousand-year-old wooden horse-and-rider from Djenne, and a cast bronze leopard and a carved ivory tusk, both from the eighteenth-century Kingdom of Benin. Other important pieces are a rare Luba mask, one of only two known in the world, a dramatic dance mask often known as a “firespitter” from Cote d’Ivoire, and a palace door created by the famed Yoruba artist Areogun of Osi.\r\n\r\nThe Native American galleries are equally rich in examples of the highest quality art, such as our unparalleled three-thousand-year-old Olmec jade mask, an exceptional nineteenth-century Sun Mask from the Northwest Coast, and a monumental pipe in the form of a bound prisoner, made in southeastern United States around 1200. Additional masterworks include the finely worked gold earspools from the ancient Andes, and a beaded man’s shoulder pouch made in Minnesota in the early 1800s.\r\n\r\nOur Oceanic collection contains world-class pieces, such as the Maori Poutokomanawa (Post Figure) created in the 1840s, the three fabulous Malagan figures, an early Papuan Gope Board, and the Bis Pole, a centerpiece of the gallery.`,
  contemporary: `In 2008 the Mia launched an initiative to focus on the art of our times. Through its new Department of Contemporary Art, the museum brings a fresh dynamism to its galleries by collecting and exhibiting works by living artists. This initiative emphasizes the relationships among historical art, diverse cultures, and contemporary art-making.\r\n\r\nContemporary art of the region continues to be represented by the Minnesota Artists Exhibition Program (MAEP) as well as by selected projects with local artists, architects, designers, and other creative thinkers. In collaboration with other Mia curatorial departments, the Department of Contemporary Art engages both local and global artists to create public and site-specific work at the Mia.`,
  dats: `Originally established to focus on furniture, metalwork, ceramics, and glass, the department today encompasses more than 18,000 works in all mediums from America and Europe, from the Middle Ages to the present.\r\n\r\nMany collectors and donors have contributed to the porcelain and pottery collection, which includes eighteenth-century French faience from Mrs. John P. Rutherfurd, seventeenth- and eighteenth-century English delft from Mr. and Mrs. George R. Steiner, and Chinese Export porcelain from Leo and Doris Hodroff. Domestic interiors and furnishings spanning four centuries are presented in the Mia’s nine period rooms, with a 1730 grand salon from the Hôtel de la Bouëxière in Paris, which has been restored with funds from the Groves Foundation.\r\n\r\nThe department’s textile collection has gained an international reputation for its spectacular individual pieces as well as its impressive holdings of European tapestries, early Italian laces, passementerie, Kashmir shawls, and Turkish embroideries. Textiles from the Jack Lenor Larsen company archive and the Norwest Modernism Collection have broadened the scope of the collection’s twentieth-century holdings, complementing its already strong collection of contemporary fiber art.\r\n\r\nA particular strength of the Mia’s decorative arts collection includes English, American and Continental silver, which is showcased in the Mary Agnes and Al McQuinn Gallery (350). Mia trustee and silver collector James Ford Bell established the foundation of the museum’s collection with numerous gifts, including a monumental eighteenth-century wine cistern by English Huguenot silversmith Paul de Lamerie and the most complete neoclassical tea service known by Paul Revere, Jr. The McQuinn Fund continues to support purchases of great English and Continental objects such as the Richmond racing cup designed by Robert Adam and an elaborate covered cup made in Strasbourg by Johann Friedrich Baer.\r\n\r\nSculpture from the Middle Ages to 1960 includes important works by Amedeo Modigliani, Sir Jacob Epstein, John Bernard Flannagan, Constantin Brancusi, Henri Matisse, and Henry Moore. Recent acquisitions in this area include Raymond Duchamp-Villon’s <em>Head of Baudelaire</em> (1911), and Alberto Giacometti’s <em>Diego</em> (196).\r\n\r\nThe Harold and Mickey Smith Gallery (362) features one of the most comprehensive permanent collections of Jewish ritual art found in an American art museum. Rotations include prints, photographs, and textiles. Purchases of modern and contemporary Judaica are made possible by the Eloise and Elliot Kaplan Fund for Judaica.\r\n\r\nThe department is strong in modernist design, including the Prairie School-style <em>Purcell-Cutts House</em> (1913), designed by William Gray Purcell and George Grant Elmslie for the Purcell family. In addition, the Mia houses one of the best collections of Prairie School material in the country, presented in the Bob Ulrich and Jill Dahlin Architecture and Design Gallery (355). The Norwest Modernism Collection is a major component of the department’s holdings, comprising nearly 500 objects dating from 1880 to 1940. In recent decades, the department has built up a significant collection of contemporary studio ceramics, glass, and wood. A current focus is design of the Scandinavian and Nordic countries. The Mia continues to showcase these collections at the Wells Fargo Center in downtown Minneapolis. On the Web, they are represented by the award-winning sites <a href=\"http://http//www.artsMia.org/unified-vision/\">Unified Vision: The Architecture and Design of the Prairie School</a> and <a href=\"http://www.artsMia.org/modernism/\">Modernism</a>.`,
  paintings: `The Mia's internationally acclaimed collection of paintings contains nearly 900 European and American works from the fourteenth century to the present. It offers a comprehensive survey of both celebrated schools and individual artists and is notable for its concentration of masterworks.\r\n\r\nOne of the museum’s earliest acquisitions was Gustave Courbet’s Deer in a Forest, which St. Paul railroad magnate James J. Hill donated in 1914. Hill’s collection of nineteenth-century French Romantic and Realist art was exceptional. Many of his most important pictures, including Eugène Delacroix’s The Fanatics of Tangier, were given or bequeathed to the Mia by his descendants.\r\n\r\nThe present paintings collection has been expanded in varied and often delightfully unpredictable ways by a succession of astute trustees, donors, directors, and curators. It includes Claude Lorrain’s Pastoral Landscape of 1638, Nicolas Poussin’s Death of Germanicus of 1627, and Rembrandt van Rijn’s Lucretia of 1666. In addition to many wonderful French nineteenth-century pictures, the museum has rich holdings of Italian Baroque, seventeenth-century Dutch, and Fauve, Cubist, and German Expressionist works. The American collection showcases a range of artistic accomplishments from Gilbert Stuart to Larry Rivers and contains exceptional paintings by John Singer Sargent and Georgia O’Keeffe.`,
  photography: `Begun in 1973, the Mia’s collection of photographs spans the history of photography from the 1860s to the present. Representing more than 800 photographers and 11,500 works of art, the collection has outstanding examples of twentieth-century American photography, with particular depth in the genres of documentary photography, photojournalism, and pictorialism. Since 2008, the museum has focused on expanding its holdings of contemporary photography and new media from all countries. This initiative increases the scope and relevance of the photography collection and enhances its links to the Mia’s diverse, global holdings.\r\n\r\nThe Department of Photography &amp; New Media continues to thrive thanks to the active, generous support of loyal donors. The earliest acquisitions were funded by Kate Butler and Hall James Peterson. Their initiative inspired others, including Harry Drake, Martin Weinstein, and Fred and Ellen Wells. More recently, the creation of the Alfred and Ingrid Lenz Harrison Fund and the establishment of the Harrison Photography Galleries (364 &amp; 365) have given the department enormous momentum. These superb new galleries are devoted to presenting the permanent collection. In addition, Linda and Lawrence Perlman established the Perlman Gallery (262), which is dedicated to featuring contemporary photography and is located in the Mia’s Target Wing, hosting <a href=\"http://www2.artsMia.org/blogs/new-pictures\">New Pictures</a>, a semi-annual series highlighting emerging photographers from around the world. You, too, can contribute to and enjoy special access to exhibitions and events by joining the <a href=\"http://new.artsMia.org/join-and-invest/affinity-groups/\">Photography &amp; New Media Affinity Group</a>.\r\n\r\nOver the years, the Department of Photography &amp; New Media has been committed to using its collection for educational purposes, and the Mia now serves as a major resource for the five-state region. Numerous exhibitions drawn from the collection have traveled to other institutions, and students and teachers frequently visit the galleries and <a href=\"http://new.artsMia.org/visit/museum-facilities/study-rooms/\">Photography Study Room</a> to learn from the collection firsthand. Click on the photograph below to browse the collection and prepare for your next visit to the Mia.`,
  prints: `The Department of Prints &amp; Drawings keeps up an active program of thematic exhibitions, but it is also the Mia’s hidden treasure chest. At any given time, only a fraction of the museum’s collection of nearly 40,000 prints and 3,000 drawings is on view in the galleries. Nearly all, however, are available to the public in the comfort of the <a href=\"http://new.artsMia.org/visit/study-rooms/\">Herschel V. Jones Print Study Room</a>. To prepare for your visit, please make an appointment by phone (612) 870-3105 or by e-mail (<a href=\"mailto:printstudy@artsMia.org\">printstudy@artsMia.org</a>).\r\n\r\nMany of the greatest European and American artists from the Renaissance to the present are represented, often in considerable depth and quality. Among the highlights are old master prints by Albrecht Dürer and Rembrandt van Rijn; Jacopo de’Barbari’s amazing bird’s-eye view of Venice; a rare presentation copy of Francisco de Goya’s <em>Los Caprichos</em>; a fabulous monotype by William Blake; extensive holdings in nineteenth-century French and British prints and drawings, featuring artists such as James McNeill Whistler, Edgar Degas, and Félix Buhot; and outstanding twentieth-century drawings by Lovis Corinth, Egon Schiele, Ernst Ludwig Kirchner, Erich Heckel, Piet Mondrian, Georges Rouault, Henri Matisse, Jasper Johns, Andy Warhol, Roy Lichtenstein, Jim Dine, Ed Ruscha, Nicola Hicks, and many more. The department is building its collection of twenty-first-century prints and drawings, which is reaching ever further beyond America and Europe to other parts of the world. P&amp;D has secured works by William Kentridge, Julie Mehretu, Mequitta Ahuja, Jaune Quick-to-See Smith, Chuck Close, Luis Jimenez, Cynthia Lin, Carlos Amorales, Diane Victor, and more.\r\n\r\nThere are also fascinating collections within the collection. The department has a large number of books designed and illustrated by artists, which is especially rich in works from France. Students of modern printmaking will want to explore the Vermillion Editions Limited Archival Collection, which contains examples of all the prints published by that Twin Cities press as well as preparatory drawings, proofs, and maquettes that led to the finished work. Botanical, zoological, fashion, and ornamental illustrations from the fifteenth through the twentieth centuries all figure in the mix, as does a wide array of works by Minnesota and regional artists.\r\n\r\nThe <a href=\"http://new.artsMia.org/join-and-invest/affinity-groups/\">Prints &amp; Drawings Affinity Group</a> provides a terrific opportunity to learn more about this vital field of art, to meet others with similar interests, and to help the Mia improve its ability to make art available to the public.`,
  cssaa: `The Department of Chinese and South and Southeast Asian Art has benefited greatly from generous gifts from knowledgeable collectors. Augustus L. Searle, Alfred F. Pillsbury, Richard P. Gale, Louis W. Hill, Jr., and Ruth and Bruce Dayton have donated collections of international reputation. These include ancient Chinese bronzes, ancient and post-Song jade, Chinese monochrome ceramics, and classical Chinese furniture. In addition, curators have built exquisite collections of Qing dynasty silk textiles and Miao textiles.\r\n\r\nSome of the first works of art to enter the museum’s collection were from South (India, Bangladesh, Sri Lanka, Pakistan, Nepal, Bhutan, and Afghanistan) and Southeast Asia (Cambodia, Laos, Myanmar, Thailand, Malaysia, Vietnam, Singapore, Indonesia, Brunei and the Philippines), beginning in 1914 when Charles Freer donated several Thai Buddhist sculptures.  In 1929 Sarah Bell Pillsbury Gale gave the museum its first major Indian work of art, a 12th century bronze (ca. 1100) Dancing Shiva (Nataraja).  The highlight of the South Asian collection is a monumental stone Yogini sculpture from 10<span style=\"font-size: 11px;\">th </span>century south India. Today the South Asian collection numbers about 150 objects and the Southeast Asian collection numbers around 183.\r\n\r\nWithin the galleries there are two Chinese period rooms including an original reception hall from the late Ming dynasty and a ca. 1700 Suzchou-area library.`,
  jka: `The collection of Japanese and Korean art includes over 7,000 works ranging from ancient to contemporary and is amongst the top five collections in the United States. The permanent display space for Japanese art is the largest in the Western world with 15 galleries and over 10,000 square feet (930 sqm). The collection itself includes Buddhist sculpture, woodblock prints, paintings, lacquer, works of bamboo, and ceramics, and it is particularly rich in works from the Edo period (1610–1868).\r\n\r\nTwo historic rooms, a formal audience hall (<i>shoin</i>) and a teahouse (<i>chashitsu</i>), allow highly visible installations within the permanent galleries and serve to heighten awareness of the relationship between art and architecture.</p><p>The Department of Japanese and Korean art has benefited greatly from generous gifts from knowledgeable collectors. Richard P. Gale, Louis W. Hill, Jr., Ruth and Bruce Dayton, and Ellen and Fred Wells have all donated specialized collections of international reputation. With the addition of over 1,500 works of art from the collections of Elizabeth and Willard “Bill” Clark and the Clark Center for Japanese Art in 2013 and half of the world-renowned Mary Griggs Burke collection, the Japanese and Korean art galleries are no doubt a destination for both art enthusiasts and scholars alike.</p><p>The department is dedicated to providing the public with a broad overview of Japanese and Korean art. By showcasing art both chronologically and by medium, the galleries show the history of not only the objects themselves, but also of a collected process of artistic creation. This can be seen, for example, by the scope of ceramics, ranging from early utilitarian to contemporary sculptures.</p><p>Of notable strength is the collection of <i>ukiyo-e</i> paintings and prints, popularly known as “pictures of the floating world”. The core of the collection was built by Richard P. Gale and Louis W. Hill, Jr., and the Gale bequest included some 57 paintings and 206 prints, many of which are rare and in admirable condition. A strong collection of <i>Ōtsu-e</i>, folk paintings produced in and around the town of Ōtsu during the Edo period, came from collectors Edson and Harriet Spencer who also donated their collection of tiger paintings.`,
}

module.exports = DepartmentDecorator
