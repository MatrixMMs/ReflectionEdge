import React, { useState, useRef, useEffect } from 'react';
import { CustomCalendarIcon, CustomChevronLeftIcon, CustomChevronRightIcon } from './Icons';

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDate(str: string | null): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, minDate, maxDate, className }) => {
  const [open, setOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'calendar' | 'monthYear'>('calendar');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Calendar state
  const today = new Date();
  const startDate = parseDate(value.start || '');
  const endDate = parseDate(value.end || '');
  const [viewYear, setViewYear] = useState(startDate?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(startDate?.getMonth() || today.getMonth());

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPickerMode('calendar');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Helpers
  const isInRange = (dateStr: string) => {
    if (!value.start || !value.end) return false;
    return dateStr > value.start && dateStr < value.end;
  };
  const isSelected = (dateStr: string) => value.start === dateStr || value.end === dateStr;
  const isHovered = (dateStr: string) => hoveredDate && value.start && !value.end && ((dateStr > value.start && dateStr <= hoveredDate) || (dateStr < value.start && dateStr >= hoveredDate));

  // Navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  // Date selection logic
  const handleDayClick = (dateStr: string) => {
    if (!value.start || (value.start && value.end)) {
      onChange({ start: dateStr, end: '' });
    } else if (dateStr < value.start) {
      onChange({ start: dateStr, end: value.start });
      setOpen(false);
    } else if (dateStr === value.start) {
      onChange({ start: dateStr, end: '' });
    } else {
      onChange({ start: value.start, end: dateStr });
      setOpen(false);
    }
  };

  // Month/year picker logic
  const handleMonthSelect = (month: number) => {
    setViewMonth(month);
    setPickerMode('calendar');
  };
  const handleYearSelect = (year: number) => {
    setViewYear(year);
    setPickerMode('monthYear');
  };

  // Render
  const renderInput = () => (
    <div
      className={`flex items-center rounded-lg border px-3 py-2 cursor-pointer select-none shadow-sm ${className || ''}`}
      style={{
        background: 'var(--background-tertiary)',
        borderColor: 'var(--border-main)',
        color: 'var(--text-main)',
        minWidth: 220,
        outline: open ? '2px solid var(--accent-blue)' : undefined,
        transition: 'outline 0.2s',
      }}
      onClick={() => setOpen(o => !o)}
      tabIndex={0}
    >
      <CustomCalendarIcon style={{ width: 20, height: 20, marginRight: 8, color: 'var(--accent-blue)' }} />
      <span style={{ flex: 1, color: value.start ? 'var(--text-main)' : 'var(--text-muted)' }}>
        {value.start && value.end ? `${value.start} - ${value.end}` : 'Select date range'}
      </span>
    </div>
  );

  const renderMonthYearPicker = () => {
    const years = Array.from({ length: 12 }, (_, i) => today.getFullYear() - i);
    return (
      <div style={{ display: 'flex', height: 200 }}>
        <div style={{ flex: 1, overflowY: 'auto', borderRight: '1px solid var(--border-main)' }}>
          {MONTHS.map((m, i) => (
            <div
              key={m}
              onClick={() => handleMonthSelect(i)}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                background: i === viewMonth ? 'var(--background-accent)' : undefined,
                color: i === viewMonth ? 'var(--text-accent)' : 'var(--text-main)',
                borderRadius: 8,
                margin: 2,
                fontWeight: i === viewMonth ? 600 : 400,
              }}
            >
              {m}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {years.map(y => (
            <div
              key={y}
              onClick={() => { setViewYear(y); setPickerMode('calendar'); }}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                background: y === viewYear ? 'var(--background-accent)' : undefined,
                color: y === viewYear ? 'var(--text-accent)' : 'var(--text-main)',
                borderRadius: 8,
                margin: 2,
                fontWeight: y === viewYear ? 600 : 400,
              }}
            >
              {y}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const days: (string | null)[] = Array(firstDay).fill(null).concat(
      Array.from({ length: daysInMonth }, (_, i) => formatDate(new Date(viewYear, viewMonth, i + 1)))
    );
    while (days.length % 7 !== 0) days.push(null);
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500, padding: 2 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {days.map((dateStr, i) => {
            if (!dateStr) return <div key={i} />;
            const isDisabled = (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate);
            const selected = isSelected(dateStr);
            const inRange = isInRange(dateStr) || isHovered(dateStr);
            return (
              <div
                key={dateStr}
                onClick={() => !isDisabled && handleDayClick(dateStr)}
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                style={{
                  margin: 1,
                  borderRadius: 8,
                  background: selected
                    ? 'var(--accent-blue)'
                    : inRange
                    ? 'linear-gradient(90deg, var(--background-accent) 0%, var(--background-accent) 100%)'
                    : undefined,
                  color: selected
                    ? 'var(--text-white)'
                    : isDisabled
                    ? 'var(--text-muted)'
                    : 'var(--text-main)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  fontWeight: selected ? 600 : 400,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: selected ? 'var(--shadow-main)' : undefined,
                  border: inRange ? '1px solid var(--accent-blue)' : undefined,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {parseDate(dateStr)?.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDropdown = () => (
    <div
      style={{
        position: 'absolute',
        zIndex: 100,
        marginTop: 8,
        minWidth: 320,
        background: 'var(--background-secondary)',
        border: '1px solid var(--border-main)',
        borderRadius: 12,
        boxShadow: 'var(--shadow-main)',
        padding: 16,
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <CustomChevronLeftIcon style={{ width: 20, height: 20, color: 'var(--text-main)' }} />
        </button>
        <button
          onClick={() => setPickerMode(pickerMode === 'calendar' ? 'monthYear' : 'calendar')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-title)', fontSize: 16 }}
        >
          {MONTHS[viewMonth]} {viewYear}
        </button>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <CustomChevronRightIcon style={{ width: 20, height: 20, color: 'var(--text-main)' }} />
        </button>
      </div>
      {pickerMode === 'monthYear' ? renderMonthYearPicker() : renderCalendarGrid()}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button
          onClick={() => { onChange({ start: '', end: '' }); setOpen(false); }}
          style={{ background: 'none', border: 'none', color: 'var(--text-link)', cursor: 'pointer', fontSize: 13, marginRight: 8 }}
        >
          Clear
        </button>
        <button
          onClick={() => setOpen(false)}
          style={{ background: 'var(--button-primary)', color: 'var(--button-text)', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
        >
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={wrapperRef}>
      {renderInput()}
      {open && renderDropdown()}
    </div>
  );
}; 