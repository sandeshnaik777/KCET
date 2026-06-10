import { YEARS } from '../../lib/supabase'

export default function YearSelect({ value, onChange, id = 'year-select' }) {
  return (
    <div>
      <label htmlFor={id} className="label">Year</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="input-field"
      >
        {YEARS.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  )
}
