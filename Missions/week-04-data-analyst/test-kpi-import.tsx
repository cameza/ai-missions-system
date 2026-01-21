import React from 'react';
import { render } from '@testing-library/react';

// Test import
try {
  const KPICard = require('./src/components/ui/kpi-card.tsx').KPICard;
  console.log('KPICard imported successfully:', KPICard);
  
  // Try to render it
  render(<div>Test</div>);
  console.log('Basic render works');
  
  render(<KPICard title="Test" value="123" loading={false} error={false} />);
  console.log('KPICard render completed');
} catch (error) {
  console.error('Import failed:', error);
}
