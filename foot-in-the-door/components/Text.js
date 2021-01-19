/** @format */

export default function TextBlock(props) {
  const textSplitAtNewlines = props.children?.split(/[\r\n][\r\n]/) ?? []

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
            <p key={index} className="py-4 font-light">
              {p}
            </p>
          )
        )}
    </>
  )
}
