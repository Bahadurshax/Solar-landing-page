import { useId } from 'react'
/* The flag of the Republic of Karakalpakstan: sky blue, yellow and green bands
   parted by narrow red stripes, with a crescent and five stars at the hoist.

   Simplified to read at 20×14 — the stars are round rather than five-pointed,
   because at this size a proper star is four dark pixels and a suggestion.

   An emoji flag was never an option: Karakalpakstan has no codepoint, and even
   Uzbekistan's renders on Windows as two letter boxes. */
function CountryFlag({ className = '' }) {
  /* The clip id has to be unique per instance. This SVG is rendered once per
     carousel card plus the featured card — seven times on a full page — and a
     hardcoded id meant seven elements sharing one, which is invalid and leaves
     `url(#…)` resolving against a duplicate. It rendered correctly in practice,
     but nothing in any spec says it has to keep doing so. */
  const clipId = useId()

  return (
    <svg
      className={`country-flag ${className}`.trim()}
      viewBox="0 0 20 14"
      width="20"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <rect width="20" height="14" rx="2.5" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect width="20" height="4.4" fill="#2ba6d9" />
        <rect y="4.4" width="20" height="0.5" fill="#ce1126" />
        <rect y="4.9" width="20" height="4.2" fill="#f7cf1c" />
        <rect y="9.1" width="20" height="0.5" fill="#ce1126" />
        <rect y="9.6" width="20" height="4.4" fill="#1fa84e" />

        {/* Crescent: a white disc with an offset blue disc bitten out of it */}
        <circle cx="3.3" cy="2.2" r="1.5" fill="#fdfdfb" />
        <circle cx="4.0" cy="2.2" r="1.25" fill="#2ba6d9" />

        {[5.9, 6.85, 7.8, 8.75, 9.7].map((cx) => (
          <circle key={cx} cx={cx} cy="2.2" r="0.4" fill="#fdfdfb" />
        ))}
      </g>

      <rect
        width="20"
        height="14"
        rx="2.5"
        fill="none"
        stroke="rgba(0,0,0,0.16)"
        strokeWidth="0.8"
      />
    </svg>
  )
}

export default CountryFlag
