import { ROUNDS } from '../../utils/categoryMap'

export default function RoundSelect({ value, onChange, id = 'round-select' }) {
  return (
    <div>
      <label htmlFor={id} className="label">Round</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      >
        {ROUNDS.map((round) => (
          <option key={round} value={round}>{round}</option>
        ))}
      </select>
    </div>
  )
}
