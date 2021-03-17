/** @format */

export default function TextBlock(props) {
  const textSplitAtNewlines = splitText(props.children)

  return (
    <>
      {textSplitAtNewlines
        .filter((text) => text)
        .map((p, index) =>
          props.dangerous ? (
            <p
              key={index}
              className="py-4 font-light"
              dangerouslySetInnerHTML={{ __html: p }}
            />
          ) : (
            <p key={index} className="pb-4 font-light">
              {p}
            </p>
          )
        )}
    </>
  )
}

export function splitText(text) {
  return (
    text
      ?.split(/[\r\n]{3,}/)
      .map((p) => p.trim().replace(/[\r\n]{1,}/g, ' <br />\n')) ?? []
  )
}
