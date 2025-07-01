import React from 'react';

const sectionStyle: React.CSSProperties = {
  background: '#181a1b',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
  color: '#e6e6e6',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const headerStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: '16px',
  color: '#e6e6e6',
};

const subHeaderStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: 600,
  margin: '24px 0 12px 0',
  color: '#e6e6e6',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '12px 0',
  color: '#b0b0b0',
};

const dangerZoneStyle: React.CSSProperties = {
  ...sectionStyle,
  border: '1px solid #ff4d4f',
  background: '#1a1a1a',
};

const dangerButtonStyle: React.CSSProperties = {
  background: '#ff4d4f',
  color: '#fff',
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
    <div style={{ background: '#131415', minHeight: '100vh', padding: '40px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', color: '#e6e6e6' }}>
        <div style={headerStyle}>Settings</div>
        <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
          {tabList.map(tab => (
            <div
              key={tab}
              style={{
                color: tab === 'Account' ? '#fff' : '#b0b0b0',
                fontWeight: tab === 'Account' ? 600 : 400,
                borderBottom: tab === 'Account' ? '2px solid #fff' : 'none',
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
            <span style={{ color: '#fff' }}>user@email.com</span>
          </div>
          <div style={labelStyle}>
            <span>Phone Number</span>
            <span style={{ color: '#fff' }}>-</span>
          </div>
          <div style={labelStyle}>
            <span>Password</span>
            <span style={{ color: '#fff' }}>********</span>
          </div>
          <div style={labelStyle}>
            <span>Gender</span>
            <span style={{ color: '#fff' }}>-</span>
          </div>
          <div style={labelStyle}>
            <span>Location customization</span>
            <span style={{ color: '#fff' }}>Use approximate location (based on IP)</span>
          </div>
        </div>

        {/* Account Authorization Section */}
        <div style={sectionStyle}>
          <div style={subHeaderStyle}>Account authorization</div>
          <div style={labelStyle}>
            <span>Google</span>
            <button style={{ ...dangerButtonStyle, background: '#333', color: '#fff', fontWeight: 400, padding: '6px 18px', marginTop: 0 }}>Connect</button>
          </div>
          <div style={labelStyle}>
            <span>Apple</span>
            <button style={{ ...dangerButtonStyle, background: '#333', color: '#fff', fontWeight: 400, padding: '6px 18px', marginTop: 0 }}>Connect</button>
          </div>
          <div style={labelStyle}>
            <span>Two-factor authentication</span>
            <span style={{ color: '#fff' }}>-</span>
          </div>
        </div>

        {/* Premium Section */}
        <div style={sectionStyle}>
          <div style={subHeaderStyle}>Reddit Premium</div>
          <div style={labelStyle}>
            <span>Get Premium</span>
            <button style={{ ...dangerButtonStyle, background: '#333', color: '#fff', fontWeight: 400, padding: '6px 18px', marginTop: 0 }}>Learn More</button>
          </div>
        </div>

        {/* Advanced Section */}
        <div style={sectionStyle}>
          <div style={subHeaderStyle}>Advanced</div>
          <div style={labelStyle}>
            <span>Advanced setting placeholder</span>
            <span style={{ color: '#fff' }}>-</span>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div style={dangerZoneStyle}>
          <div style={{ ...subHeaderStyle, color: '#ff4d4f' }}>Danger Zone</div>
          <div style={{ marginBottom: 12 }}>Delete all your data. This action cannot be undone.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button style={dangerButtonStyle}>Delete All Trade Data</button>
            <button style={dangerButtonStyle}>Delete All MBS Data</button>
            <button style={dangerButtonStyle}>Delete All Custom Tag Data</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 