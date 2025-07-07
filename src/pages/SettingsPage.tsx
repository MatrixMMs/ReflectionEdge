import React from 'react';

const sectionStyle: React.CSSProperties = {
  background: 'var(--background-main)',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
  color: 'var(--text-main)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const headerStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: '16px',
  color: 'var(--text-main)',
};

const subHeaderStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: 600,
  margin: '24px 0 12px 0',
  color: 'var(--text-main)',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '12px 0',
  color: 'var(--text-secondary)',
};

const dangerZoneStyle: React.CSSProperties = {
  ...sectionStyle,
  border: '1px solid var(--accent-red)',
  background: 'var(--background-secondary)',
};

const dangerButtonStyle: React.CSSProperties = {
  background: 'var(--accent-red)',
  color: 'var(--text-white)',
  border: 'none',
  borderRadius: '4px',
  padding: '10px 24px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '16px',
};

const tabList = [
  'Account',
  'Profile',
  'Privacy',
  'Preferences',
  'Notifications',
  'Email',
];

const SettingsPage: React.FC = () => {
  return (
    <div style={{ background: 'var(--background-main)', minHeight: '100vh', padding: '40px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', color: 'var(--text-main)' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, marginTop: 8 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 550, color: 'var(--text-main)' }}>Settings</h1>
          {/* Future: Filters, etc. */}
        </div>
        <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
          {tabList.map(tab => (
            <div
              key={tab}
              style={{
                color: tab === 'Account' ? 'var(--text-white)' : 'var(--text-secondary)',
                fontWeight: tab === 'Account' ? 600 : 400,
                borderBottom: tab === 'Account' ? '2px solid var(--text-white)' : 'none',
                paddingBottom: 6,
                cursor: 'pointer',
                fontSize: '1.1rem',
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* General Section */}
        <div style={sectionStyle}>
          <div style={subHeaderStyle}>General</div>
          <div style={labelStyle}>
            <span>Email address</span>
            <span style={{ color: 'var(--text-white)' }}>user@email.com</span>
          </div>
          <div style={labelStyle}>
            <span>Phone Number</span>
            <span style={{ color: 'var(--text-white)' }}>-</span>
          </div>
          <div style={labelStyle}>
            <span>Password</span>
            <span style={{ color: 'var(--text-white)' }}>********</span>
          </div>
          <div style={labelStyle}>
            <span>Gender</span>
            <span style={{ color: 'var(--text-white)' }}>-</span>
          </div>
          <div style={labelStyle}>
            <span>Location customization</span>
            <span style={{ color: 'var(--text-white)' }}>Use approximate location (based on IP)</span>
          </div>
        </div>

        {/* Account Authorization Section */}
        <div style={sectionStyle}>
          <div style={subHeaderStyle}>Account authorization</div>
          <div style={labelStyle}>
            <span>Google</span>
            <button style={{ ...dangerButtonStyle, background: 'var(--background-tertiary)', color: 'var(--text-white)', fontWeight: 400, padding: '6px 18px', marginTop: 0 }}>Connect</button>
          </div>
          <div style={labelStyle}>
            <span>Apple</span>
            <button style={{ ...dangerButtonStyle, background: 'var(--background-tertiary)', color: 'var(--text-white)', fontWeight: 400, padding: '6px 18px', marginTop: 0 }}>Connect</button>
          </div>
          <div style={labelStyle}>
            <span>Two-factor authentication</span>
            <span style={{ color: 'var(--text-white)' }}>-</span>
          </div>
        </div>

        {/* Premium Section */}
        <div style={sectionStyle}>
          <div style={subHeaderStyle}>Reddit Premium</div>
          <div style={labelStyle}>
            <span>Get Premium</span>
            <button style={{ ...dangerButtonStyle, background: 'var(--background-tertiary)', color: 'var(--text-white)', fontWeight: 400, padding: '6px 18px', marginTop: 0 }}>Learn More</button>
          </div>
        </div>

        {/* Advanced Section */}
        <div style={sectionStyle}>
          <div style={subHeaderStyle}>Advanced</div>
          <div style={labelStyle}>
            <span>Advanced setting placeholder</span>
            <span style={{ color: 'var(--text-white)' }}>-</span>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div style={dangerZoneStyle}>
          <div style={{ ...subHeaderStyle, color: 'var(--accent-red)' }}>Danger Zone</div>
          <div style={{ marginBottom: 12 }}>Delete all your data. This action cannot be undone.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button style={{ ...dangerButtonStyle, background: 'var(--accent-red)', color: 'var(--text-white)' }}>Delete All Trade Data</button>
            <button style={{ ...dangerButtonStyle, background: 'var(--accent-red)', color: 'var(--text-white)' }}>Delete All MBS Data</button>
            <button style={{ ...dangerButtonStyle, background: 'var(--accent-red)', color: 'var(--text-white)' }}>Delete All Custom Tag Data</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 