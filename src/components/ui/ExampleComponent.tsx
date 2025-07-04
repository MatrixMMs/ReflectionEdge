import React from 'react';

const ExampleComponent: React.FC = () => {
  return (
    <div style={{ 
      backgroundColor: 'var(--background-main)',
      color: 'var(--text-main)',
      padding: 'var(--spacing-4)',
      borderRadius: 'var(--border-radius)',
      fontFamily: 'var(--font-family-sans)'
    }}>
      <h2 style={{ 
        color: 'var(--text-accent)',
        fontSize: 'var(--font-size-xl)',
        marginBottom: 'var(--spacing-4)'
      }}>
        CSS Variables Example
      </h2>
      
      <p style={{ 
        color: 'var(--text-secondary)',
        fontSize: 'var(--font-size-base)',
        marginBottom: 'var(--spacing-3)'
      }}>
        This component uses CSS custom properties (variables) for consistent styling.
      </p>
      
      <div style={{ 
        display: 'flex',
        gap: 'var(--spacing-3)',
        marginTop: 'var(--spacing-4)'
      }}>
        <button style={{
          backgroundColor: 'var(--accent-blue)',
          color: 'var(--text-white)',
          padding: 'var(--spacing-2) var(--spacing-4)',
          borderRadius: 'var(--border-radius)',
          border: 'none',
          cursor: 'pointer'
        }}>
          Primary Button
        </button>
        
        <button style={{
          backgroundColor: 'var(--accent-green)',
          color: 'var(--text-white)',
          padding: 'var(--spacing-2) var(--spacing-4)',
          borderRadius: 'var(--border-radius)',
          border: 'none',
          cursor: 'pointer'
        }}>
          Success Button
        </button>
      </div>
    </div>
  );
};

export default ExampleComponent; 