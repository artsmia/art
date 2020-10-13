/** @format */
import Link from 'next/link'

function LRNav(props) {
  const { classifications, classification, children, ...containerProps } = props

  const _cls = classifications.map((c) => c.toLowerCase())
  const roomIndex = _cls.indexOf(classification)
  const prevRoom = _cls[(roomIndex - 1) % _cls.length] || 'mixed media' // how does math work again?! wrapping around would be better than `undefined || const`
  const nextRoom = _cls[(roomIndex + 1) % _cls.length]

  return (
    <nav className={`flex justify-between`} {...containerProps}>
      <Link href={`/room/${prevRoom.replace(' ', '-')}`}>
        <a className="uppercase">&larr; {prevRoom}</a>
      </Link>
      {children}
      <Link href={`/room/${nextRoom.replace(' ', '-')}`}>
        <a className="uppercase">{nextRoom} &rarr;</a>
      </Link>
    </nav>
  )
}

export default LRNav
