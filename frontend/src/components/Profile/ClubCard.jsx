import './ClubCard.css';

const CLUB_TYPES = [
  { value: 'driver', label: 'Driver' },
  { value: '3w', label: '3 Wood' },
  { value: '5w', label: '5 Wood' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'iron', label: 'Iron' },
  { value: 'wedge', label: 'Wedge' },
  { value: 'putter', label: 'Putter' },
];

const SHAFT_FLEXES = ['Ladies', 'Senior', 'Regular', 'Stiff', 'X-Stiff'];
const SHAFT_MATERIALS = ['Steel', 'Graphite'];
const GRIP_SIZES = ['Undersize', 'Standard', 'Midsize', 'Oversize', 'Jumbo'];
const WEDGE_ROLES = ['GW', 'SW', 'LW'];

export default function ClubCard({ club, index, onChange, onRemove }) {
  const handleChange = (field, value) => {
    onChange(index, { ...club, [field]: value });
  };

  const isWedge = club.type === 'wedge';
  const showDistance = ['driver', '3w', '5w', 'hybrid', 'wedge'].includes(club.type);

  return (
    <div className="club-card card">
      <div className="club-card-header">
        <span className="club-number">Club {index + 1}</span>
        <button 
          type="button"
          className="btn btn-ghost btn-sm remove-club"
          onClick={() => onRemove(index)}
        >
          ✕ Remove
        </button>
      </div>

      <div className="club-card-body">
        <div className="club-row">
          <div className="form-group">
            <label className="form-label">Club Type *</label>
            <select 
              className="form-select"
              value={club.type}
              onChange={(e) => handleChange('type', e.target.value)}
              required
            >
              <option value="">Select type</option>
              {CLUB_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Brand *</label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g., TaylorMade"
              value={club.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="club-row">
          <div className="form-group">
            <label className="form-label">Model *</label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g., Stealth 2"
              value={club.model}
              onChange={(e) => handleChange('model', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Model Year</label>
            <input 
              type="number"
              className="form-input"
              placeholder="e.g., 2024"
              value={club.modelYear}
              onChange={(e) => handleChange('modelYear', e.target.value)}
              min="1990"
              max="2030"
            />
          </div>
        </div>

        <details className="club-details">
          <summary>Optional Details</summary>
          <div className="club-details-content">
            <div className="club-row">
              <div className="form-group">
                <label className="form-label">Loft (°)</label>
                <input 
                  type="number"
                  className="form-input"
                  placeholder="e.g., 10.5"
                  value={club.loft}
                  onChange={(e) => handleChange('loft', e.target.value)}
                  step="0.5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shaft Flex</label>
                <select 
                  className="form-select"
                  value={club.shaftFlex}
                  onChange={(e) => handleChange('shaftFlex', e.target.value)}
                >
                  <option value="">Select</option>
                  {SHAFT_FLEXES.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="club-row">
              <div className="form-group">
                <label className="form-label">Shaft Material</label>
                <select 
                  className="form-select"
                  value={club.shaftMaterial}
                  onChange={(e) => handleChange('shaftMaterial', e.target.value)}
                >
                  <option value="">Select</option>
                  {SHAFT_MATERIALS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Grip Size</label>
                <select 
                  className="form-select"
                  value={club.gripSize}
                  onChange={(e) => handleChange('gripSize', e.target.value)}
                >
                  <option value="">Select</option>
                  {GRIP_SIZES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {showDistance && (
              <div className="form-group">
                <label className="form-label">Carry Distance (yards)</label>
                <input 
                  type="number"
                  className="form-input"
                  placeholder="e.g., 250"
                  value={club.carryDistance}
                  onChange={(e) => handleChange('carryDistance', e.target.value)}
                  min="0"
                  max="400"
                />
              </div>
            )}

            {isWedge && (
              <div className="club-row">
                <div className="form-group">
                  <label className="form-label">Wedge Role</label>
                  <select 
                    className="form-select"
                    value={club.wedgeRole}
                    onChange={(e) => handleChange('wedgeRole', e.target.value)}
                  >
                    <option value="">Select</option>
                    {WEDGE_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Bounce</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g., 10°"
                    value={club.bounce}
                    onChange={(e) => handleChange('bounce', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Grind</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g., S"
                    value={club.grind}
                    onChange={(e) => handleChange('grind', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
