import './FilterPills.css';

const FILTERS = [
  { label: 'All', value: null },
  { label: 'Modalities', value: 'modality' },
  { label: 'Devices', value: 'device' },
  { label: 'Compounds', value: 'compound' },
];

export default function FilterPills({ active, onChange }) {
  return (
    <div className="filter-pills">
      {FILTERS.map((f) => (
        <button
          key={f.label}
          className={`filter-pill${active === f.value ? ' active' : ''}`}
          onClick={() => onChange(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
