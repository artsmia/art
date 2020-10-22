/** @format */
import { useRouter } from 'next/router'

import { HiSearch } from '@meronex/icons/hi'

function SearchInput(props) {
  const { terms, className } = props
  const router = useRouter()

  return (
    <>
      <label
        htmlFor="search"
        className={[
          'flex relative p-1 w-full border-b-2 items-center focus-within:border-teal-500 group',
          className,
        ].join(' ')}
      >
        <span className="sr-only w-0">Search</span>
        <div className="z-10 left-4 absolute" aria-hidden="true">
          <HiSearch size={'2rem'} className="text-gray-400 fill-current" />
        </div>
        <input
          id="search"
          type="search"
          name="q"
          defaultValue={terms}
          placeholder="Search for artist, keyword, color, etc"
          className="w-full p-1 pl-10"
          onKeyPress={(event) => {
            const {
              target: { value: terms },
            } = event

            if (event.key === 'Enter') {
              router.push(`/search/${terms}`)
            }
          }}
        />
      </label>
    </>
  )
}

export default SearchInput
