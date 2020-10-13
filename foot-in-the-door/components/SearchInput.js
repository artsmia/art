/** @format */
import { useRouter } from 'next/router'

function SearchInput(props) {
  const { terms } = props
  const router = useRouter()

  return (
    <>
      <label htmlFor="search" className="invisible">
        Search
      </label>
      <input
        id="search"
        defaultValue={terms}
        type="search"
        placeholder="Search for artist, medium, keyword, color, etc"
        className="p-4 w-full"
        onKeyPress={(event) => {
          const {
            target: { value: terms },
          } = event
          console.info('search onKeyPress', { terms })

          if (event.key === 'Enter') {
            console.info('search onEnter', { terms })
            router.push(`/search/${terms}`)
          }
        }}
      />
    </>
  )
}

export default SearchInput
