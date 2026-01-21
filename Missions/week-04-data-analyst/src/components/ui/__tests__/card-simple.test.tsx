import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../card';

describe('Card Simple Test', () => {
  it('renders card with content', () => {
    const { container } = render(
      <Card variant="glass" padding="default">
        <div>Test Content</div>
      </Card>
    );
    
    console.log('Container HTML:', container.innerHTML);
    console.log('Document body:', document.body.innerHTML);
    
    // Check if content is rendered
    const content = screen.getByText('Test Content');
    expect(content).toBeInTheDocument();
  });
});
