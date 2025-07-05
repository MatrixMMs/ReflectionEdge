import React, { useState } from 'react';
import { CalendarIcon } from './Icons';

interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

// Helper functions for date math
function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
function formatMonthYear(date: Date) {
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function pad(n: number) { return n < 10 ? `0${n}` : n; }
function toISO(date: Date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, minDate, maxDate, className }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'from' | 'until'>('from');
  const [viewDate, setViewDate] = useState(() => value.start ? new Date(value.start) : new Date());
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Parse value
  const start = value.start ? new Date(value.start) : null;
  const end = value.end ? new Date(value.end) : null;

  // Calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)]);

  // Range highlight logic
  function isInRange(date: Date) {
    if (!start || !end) return false;
    return date >= start && date <= end;
  }
  function isHovered(date: Date) {
    if (!start || !hoverDate) return false;
    const hover = new Date(hoverDate);
    if (hover > start) return date > start && date <= hover;
    if (hover < start) return date < start && date >= hover;
    return false;
  }
  function isSelected(date: Date) {
    return (start && date.toDateString() === start.toDateString()) || (end && date.toDateString() === end.toDateString());
  }

  // Handlers
  function handleDayClick(date: Date) {
    if (tab === 'from') {
      onChange({ start: toISO(date), end: value.end && new Date(value.end) >= date ? value.end : '' });
      setTab('until');
    } else {
      if (value.start && new Date(value.start) <= date) {
        onChange({ start: value.start, end: toISO(date) });
        setOpen(false);
      } else {
        onChange({ start: toISO(date), end: '' });
        setTab('until');
      }
    }
  }

  function handleMonthChange(offset: number) {
    setViewDate(addMonths(viewDate, offset));
  }

  // Render
  return (
    <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700 focus:outline-none"
        style={{ background: 'var(--background-tertiary)', color: 'var(--text-main)', borderColor: 'var(--border-main)' }}
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <span className="inline-flex items-center">
          <CalendarIcon className="mr-1 w-5 h-5" style={{ color: 'var(--accent-purple)' }} />
          {value.start && value.end ? `${value.start} - ${value.end}` : 'Select date range'}
        </span>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-80 rounded-xl shadow-xl border border-gray-700 bg-gray-900" style={{ background: 'var(--background-secondary)', color: 'var(--text-main)', borderColor: 'var(--border-main)' }}>
          {/* Tabs */}
          <div className="flex">
            <button
              className={`flex-1 py-2 rounded-tl-xl text-sm font-semibold transition-colors duration-150 ${tab === 'from' ? 'tab-active' : 'tab-inactive'}`}
              style={tab === 'from' ? { background: 'var(--gradient-green)', color: 'var(--text-main)', backgroundImage: 'var(--gradient-green)' } : { background: 'var(--background-tertiary)', color: 'var(--text-secondary)' }}
              onClick={() => setTab('from')}
              type="button"
            >From</button>
            <button
              className={`flex-1 py-2 rounded-tr-xl text-sm font-semibold transition-colors duration-150 ${tab === 'until' ? 'tab-active' : 'tab-inactive'}`}
              style={tab === 'until' ? { background: 'var(--gradient-green)', color: 'var(--text-main)', backgroundImage: 'var(--gradient-green)' } : { background: 'var(--background-tertiary)', color: 'var(--text-secondary)' }}
              onClick={() => setTab('until')}
              type="button"
            >Until</button>
          </div>
          {/* Month/Year Selector */}
          <div className="flex items-center justify-between px-4 py-2">
            <button className="p-1 rounded hover:bg-gray-700" onClick={() => handleMonthChange(-1)} type="button">&#8592;</button>
            <span className="font-semibold">{formatMonthYear(viewDate)}</span>
            <button className="p-1 rounded hover:bg-gray-700" onClick={() => handleMonthChange(1)} type="button">&#8594;</button>
          </div>
          {/* Calendar Grid */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-7 text-xs text-center mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="py-1 text-gray-400">{d}</div>)}
            </div>
            {weeks.map((week, i) => {
              // Find range start/end in this week
              let rangeStartIdx = -1, rangeEndIdx = -1;
              week.forEach((date, idx) => {
                if (date && start && end && date >= start && date <= end) {
                  if (rangeStartIdx === -1) rangeStartIdx = idx;
                  rangeEndIdx = idx;
                }
              });
              return (
                <div className="grid grid-cols-7 relative" key={i} style={{ minHeight: 36 }}>
                  {/* Range strip */}
                  {rangeStartIdx !== -1 && rangeEndIdx !== -1 && (
                    <div
                      className="absolute top-1/2 left-0 right-0 h-6 -translate-y-1/2 pointer-events-none"
                      style={{
                        gridColumnStart: rangeStartIdx + 1,
                        gridColumnEnd: rangeEndIdx + 2,
                        background: 'var(--gradient-green)',
                        borderRadius: rangeStartIdx === 0 ? '999px 0 0 999px' : rangeEndIdx === 6 ? '0 999px 999px 0' : '0',
                        opacity: 0.25,
                        zIndex: 0,
                        marginLeft: `calc(${rangeStartIdx} * 100% / 7)`,
                        marginRight: `calc(${6 - rangeEndIdx} * 100% / 7)`
                      }}
                    />
                  )}
                  {week.map((date, j) => {
                    if (!date) return <div key={j} className="py-1" />;
                    const iso = toISO(date);
                    const selected = isSelected(date);
                    const inRange = isInRange(date);
                    const hovered = isHovered(date);
                    return (
                      <button
                        key={j}
                        className={`py-1.5 rounded-full text-sm font-medium w-8 h-8 mx-auto relative z-10
                          ${selected ? 'bg-green-600 text-white' : inRange ? 'bg-green-900/40 text-green-200' : hovered ? 'bg-green-700/60 text-white' : 'hover:bg-gray-700'}
                        `}
                        style={selected ? { background: 'var(--gradient-green)', color: 'var(--text-main)', backgroundImage: 'var(--gradient-green)' } : inRange ? { background: 'transparent', color: 'var(--accent-green)' } : hovered ? { background: 'var(--accent-green)', color: 'var(--text-main)' } : {}}
                        onClick={() => handleDayClick(date)}
                        onMouseEnter={() => setHoverDate(iso)}
                        onMouseLeave={() => setHoverDate(null)}
                        type="button"
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}; 