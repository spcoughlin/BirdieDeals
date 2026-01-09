import './ProgressIndicator.css';

export default function ProgressIndicator({ currentStep, totalSteps, stepLabels = [] }) {
  return (
    <div className="progress-indicator">
      <div className="progress-steps">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div 
            key={i}
            className={`progress-step ${i < currentStep ? 'completed' : ''} ${i === currentStep ? 'active' : ''}`}
          >
            <div className="step-circle">
              {i < currentStep ? '✓' : i + 1}
            </div>
            {stepLabels[i] && (
              <span className="step-label">{stepLabels[i]}</span>
            )}
          </div>
        ))}
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
