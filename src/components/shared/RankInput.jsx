export default function RankInput({ value, onChange, id = 'rank-input' }) {
  return (
    <div>
      <label htmlFor={id} className="label">Your KCET Rank</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-500 select-none">#</span>
        <input
          id={id}
          type="number"
          min="1"
          max="200000"
          placeholder="e.g. 25000"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pl-8 font-semibold"
          autoComplete="off"
        />
      </div>
      {value && (parseInt(value) < 1 || parseInt(value) > 200000) && (
        <p className="text-xs text-red-500 mt-1">Enter a rank between 1 and 2,00,000</p>
      )}
    </div>
  )
}
