import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from './src/components/ui/card';

// Simple test to see if Card component works
console.log('Testing Card component...');

try {
  const { container } = render(
    <Card variant="glass" padding="default">
      <div>Test Content</div>
    </Card>
  );
  
  console.log('Card rendered successfully');
  console.log('Container HTML:', container.innerHTML);
  console.log('Document body:', document.body.innerHTML);
  
  // Check if content is rendered
  const content = screen.getByText('Test Content');
  console.log('Content found:', content);
} catch (error) {
  console.error('Card test failed:', error);
}
