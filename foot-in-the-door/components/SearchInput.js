/** @format */
import { useState } from 'react'
import { useRouter } from 'next/router'

import { HiSearch } from '@meronex/icons/hi'

import { cx } from '../util'

function SearchInput(props) {
  const { terms, className, dark, placeholder: _placeholder } = props
  const router = useRouter()

  const placeholder = _placeholder || 'Search for artist, keyword, color, etc'

  return (
    <>
      <label
        htmlFor="search"
        className={cx(
          'flex relative p-1 w-full border-b-2 items-center group',
          className
        )}
      >
        <span className="sr-only w-0">Search</span>
        <div className="z-10 left-4 absolute" aria-hidden="true">
          <HiSearch
            size={'2rem'}
            className={cx(
              'fill-current',
              dark ? 'text-grey-400' : 'text-black'
            )}
          />
        </div>
        <input
          id="search"
          type="search"
          name="q"
          defaultValue={terms}
          placeholder={placeholder}
          className={cx(
            'w-full p-1 pl-10',
            dark ? 'bg-black text-white' : '',
            'outline-none'
          )}
          onKeyPress={(event) => {
            const {
              target: { value: terms },
            } = event

            if (event.key === 'Enter') {
              router.push(`/search/${terms}`)
            }
          }}
          onFocus={() => props.onFocus && props.onFocus()}
          onBlur={() => props.onBlur && props.onBlur()}
        />
      </label>
    </>
  )
}

export default SearchInput

export function ExpandableSearchInput(props) {
  const { open, className, ...searchProps } = props
  const [showSearchInput, setShowSearchInput] = useState(open)

  function toggleSearch() {
    setShowSearchInput(!showSearchInput)
  }

  return (
    <>
      <SearchInput
        {...searchProps}
        className={cx(
          showSearchInput ? 'max-w-full' : 'max-w-12 border-transparent',
          'transition-width duration-500 ',
          className
        )}
        onFocus={toggleSearch}
        onBlur={toggleSearch}
        placeholder="Search"
      />
    </>
  )
}
