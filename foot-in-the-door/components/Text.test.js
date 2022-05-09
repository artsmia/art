/** @format */

import { splitText } from './Text'

describe('break raw JSON text with various newlines into paragraphs', () => {
  test('simple paragraphs', () => {
    expect(splitText('p1\n\r\n\rp2')).toEqual(['p1', 'p2'])
  })

  test('mix of hard breaks and paragraphs', () => {
    expect(splitText('p1l1\n\rp1l2\n\r\n\rp2')).toEqual([
      'p1l1 <br />\np1l2',
      'p2',
    ])
  })

  test('i self divine', () => {
    const unsplit =
      'Welcome / new horizons / where the mind is\r\nMore than just land and sky / I’m intertwining\r\nPlanets / spinning alignment with assignments\r\nSlightly pivoted to the Suns divineness\r\nUnseen but felt like air\r\nEverything is extravagant done with flair\r\nFrom the way that we walk / we glide we there\r\nTextures of the hair and clothes we wear\r\n\r\n—I Self Devine, “Grand Rising,” from the album Rituals of Resilience\r\n\r\n\r\nRituals of Resilience is an audio-visual experience bringing the work of Black visual artists into dialogue with a sonic landscape created by Twin Cities-based musician, artist, and community organizer Chaka Mkali (aka I Self Devine). The accompanying album grew from Mkali’s in-depth research on the work of each artist, and approaches their individual visual practice as a means to access and articulate a collective Black consciousness that transcends time and space. \r\n\r\nHere, images, words, and music combine to explore themes of identity, culture, spirituality and power through the embodiment of Black lived experience. As Chaka Mkali explains: \r\n\r\nRituals of Resilience is about the act of survival under intense pressure and heat. A place to hide when being in your body isn’t safe. A reimagining of new worlds and possibilities. The creative culture of Indigenous and diasporic ethnic groups of African descent surviving and dismantling 400 years of white supremacy. . . through a visceral fabric of repetitious intentional movements, vibrations, gatherings, acts, symbols, and codes.'
    const split = [
      `Welcome / new horizons / where the mind is <br />
More than just land and sky / I’m intertwining <br />
Planets / spinning alignment with assignments <br />
Slightly pivoted to the Suns divineness <br />
Unseen but felt like air <br />
Everything is extravagant done with flair <br />
From the way that we walk / we glide we there <br />
Textures of the hair and clothes we wear`,
      '—I Self Devine, “Grand Rising,” from the album Rituals of Resilience',
      'Rituals of Resilience is an audio-visual experience bringing the work of Black visual artists into dialogue with a sonic landscape created by Twin Cities-based musician, artist, and community organizer Chaka Mkali (aka I Self Devine). The accompanying album grew from Mkali’s in-depth research on the work of each artist, and approaches their individual visual practice as a means to access and articulate a collective Black consciousness that transcends time and space.',
      'Here, images, words, and music combine to explore themes of identity, culture, spirituality and power through the embodiment of Black lived experience. As Chaka Mkali explains:',
      'Rituals of Resilience is about the act of survival under intense pressure and heat. A place to hide when being in your body isn’t safe. A reimagining of new worlds and possibilities. The creative culture of Indigenous and diasporic ethnic groups of African descent surviving and dismantling 400 years of white supremacy. . . through a visceral fabric of repetitious intentional movements, vibrations, gatherings, acts, symbols, and codes.',
    ]

    expect(splitText(unsplit)).toEqual(split)
  })
})
