import { X } from 'lucide-react';

import { NOTE_COLORS } from '../constants';

interface ColorPickerProps {
    value: string | null;
    onChange: (color: string | null) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => (
    <div className="flex items-center gap-1.5">
        <button
            onClick={() => onChange(null)}
            title="No color"
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                value === null
                    ? 'border-gray-500 bg-gray-100 dark:bg-gray-700 scale-110'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'
            }`}
        >
            {value === null && <X className="w-2.5 h-2.5 text-gray-500" />}
        </button>

        {NOTE_COLORS.map(color => (
            <button
                key={color.key}
                onClick={() => onChange(color.key)}
                title={color.label}
                className={`w-5 h-5 rounded-full border-2 transition-all ${color.dot} ${
                    value === color.key
                        ? 'border-gray-700 dark:border-gray-200 scale-110'
                        : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                }`}
            />
        ))}
    </div>
);
