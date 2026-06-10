import { CATEGORIES_PRIMARY } from '../../utils/categoryMap'

export default function CategorySelect({ value, onChange, id = 'category-select', showAll = false }) {
  return (
    <div>
      <label htmlFor={id} className="label">Category</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      >
        {CATEGORIES_PRIMARY.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  )
}
