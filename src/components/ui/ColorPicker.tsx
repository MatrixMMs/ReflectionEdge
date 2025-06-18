
import React, { useState, useEffect } from 'react';
import { Input } from './Input';

interface ColorPickerProps {
  initialColor: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ initialColor, onChange, label }) => {
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    setColor(initialColor);
  }, [initialColor]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    // Basic validation for hex color
    if (/^#[0-9A-F]{6}$/i.test(newColor) || /^#[0-9A-F]{3}$/i.test(newColor)) {
      onChange(newColor);
    }
  };
  
  const handleBlur = () => {
    // Ensure onChange is called with the current valid color, even if input is temporarily invalid
     if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
        onChange(color);
     } else {
        setColor(initialColor); // Revert if invalid on blur
     }
  }

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        value={color}
        onChange={handleColorChange}
        onBlur={handleBlur}
        label={label}
        className="w-32"
        maxLength={7}
      />
      <input
        type="color"
        value={/#[0-9A-F]{6}/i.test(color) ? color : '#000000'} // Native picker needs valid 6-digit hex
        onChange={(e) => {
            setColor(e.target.value);
            onChange(e.target.value);
        }}
        className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent"
        style={{backgroundColor: color}} // Show selected color in the text input's adjacent picker
      />
    </div>
  );
};
    