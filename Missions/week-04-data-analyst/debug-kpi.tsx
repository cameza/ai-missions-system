import React from 'react';
import { render } from '@testing-library/react';
import { KPICard } from './src/components/ui/kpi-card';

// Simple debug test
console.log('Starting debug test...');

try {
  const { container } = render(
    <KPICard 
      title="Test Card"
      value="1234"
      loading={false} 
      error={false} 
    />
  );
  
  console.log('Container HTML:', container.innerHTML);
  console.log('Document body:', document.body.innerHTML);
  console.log('Test completed successfully');
} catch (error) {
  console.error('Test failed:', error);
}
