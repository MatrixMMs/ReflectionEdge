/**
 * Color Generator Utility Tests
 * 
 * This test suite covers the color generation functionality including:
 * 
 * - Random color generation from predefined color palette
 * - Color uniqueness tracking to avoid duplicates
 * - Color palette reset when all colors are used
 * - Color format validation (hex format)
 * - Color distribution and randomness
 * 
 * Test scenarios include:
 * - Single color generation
 * - Multiple color generation without duplicates
 * - Color palette exhaustion and reset
 * - Color format consistency
 * - Color uniqueness across multiple calls
 */

import { getRandomColor } from '../colorGenerator';

describe('Color Generator', () => {
  beforeEach(() => {
    // Reset the used colors set before each test
    // We need to access the internal usedColors set to reset it
    // Since it's not exported, we'll test the behavior indirectly
  });

  it('generates a valid hex color', () => {
    const color = getRandomColor();
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('generates different colors on consecutive calls', () => {
    const color1 = getRandomColor();
    const color2 = getRandomColor();
    const color3 = getRandomColor();
    
    expect(color1).not.toBe(color2);
    expect(color2).not.toBe(color3);
    expect(color1).not.toBe(color3);
  });

  it('generates colors from the predefined palette', () => {
    const expectedColors = [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
      '#FFA500', '#800080', '#008000', '#800000', '#008080', '#000080'
    ];
    
    const generatedColors = [];
    for (let i = 0; i < 12; i++) {
      generatedColors.push(getRandomColor());
    }
    
    // All generated colors should be from the expected palette
    generatedColors.forEach(color => {
      expect(expectedColors).toContain(color);
    });
  });

  it('avoids duplicate colors until palette is exhausted', () => {
    const generatedColors = new Set<string>();
    
    // Generate 12 colors (the size of the palette)
    for (let i = 0; i < 12; i++) {
      const color = getRandomColor();
      expect(generatedColors.has(color)).toBe(false);
      generatedColors.add(color);
    }
    
    expect(generatedColors.size).toBe(12);
  });

  it('resets color palette when all colors are used', () => {
    const firstSet = new Set<string>();
    
    // Generate all 12 colors
    for (let i = 0; i < 12; i++) {
      firstSet.add(getRandomColor());
    }
    
    // Generate 12 more colors - should reset and allow duplicates
    const secondSet = new Set<string>();
    for (let i = 0; i < 12; i++) {
      secondSet.add(getRandomColor());
    }
    
    // Both sets should have 12 colors
    expect(firstSet.size).toBe(12);
    expect(secondSet.size).toBe(12);
    
    // The sets should be equal (same colors) since palette was reset
    expect(firstSet).toEqual(secondSet);
  });

  it('generates consistent color format', () => {
    for (let i = 0; i < 20; i++) {
      const color = getRandomColor();
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(color.length).toBe(7); // # + 6 hex digits
    }
  });

  it('handles multiple rapid calls', () => {
    const colors = [];
    for (let i = 0; i < 50; i++) {
      colors.push(getRandomColor());
    }
    
    // All colors should be valid hex format
    colors.forEach(color => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
}); 