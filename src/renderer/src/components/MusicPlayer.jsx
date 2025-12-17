import React, { useState } from 'react'

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPowerOn, setIsPowerOn] = useState(false)

  const [targetApp, setTargetApp] = useState('Spotify')
  const [isEditingApp, setIsEditingApp] = useState(false)

  const handleControl = (action) => {
    if (!isPowerOn) {
      return
    }
    if (window.api) {
      window.api.mediaControl(action)
      if (action === 'play-pause') {
        setIsPlaying(!isPlaying)
      }
    }
  }
  const togglePower = () => {
    if (window.api) {
      if (isPowerOn) {
        window.api.appControl('close', targetApp)
        setIsPowerOn(false)
        setIsPlaying(false)
      } else {
        window.api.appControl('open', targetApp)
        setIsPowerOn(true)
      }
    }
  }

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: '#222',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
        boxSizing: 'border-box',
        borderTop: '1px solid #333'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎵</span>
          {isEditingApp ? (
            <input
              type="text"
              value={targetApp}
              onChange={(e) => setTargetApp(e.target.value)}
              onBlur={() => setIsEditingApp(false)}
              autoFocus
              style={{
                width: '80px',
                background: '#333',
                color: 'white',
                border: 'none',
                padding: '2px'
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditingApp(true)}
              title="클릭하여 제어할 앱 이름 변경"
              style={{
                fontSize: '0.9rem',
                color: '#ccc',
                cursor: 'pointer',
                borderBottom: '1px dotted #555'
              }}
            >
              {targetApp}
            </span>
          )}
        </div>
        <button
          onClick={togglePower}
          title={isPowerOn ? '앱 종료' : '앱 실행'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: isPowerOn ? '#4caf50' : '#555',
            transition: 'color 0.3s'
          }}
        >
          ⏻
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <button onClick={() => handleControl('prev')} style={btnStyle}>
          ⏮
        </button>
        <button
          onClick={() => handleControl('play-pause')}
          style={{ ...btnStyle, fontSize: '2rem', color: isPlaying ? '#4caf50' : 'white' }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={() => handleControl('next')} style={btnStyle}>
          ⏭
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <button onClick={() => handleControl('vol-down')} style={subBtnStyle}>
          🔉 -
        </button>
        <button onClick={() => handleControl('mute')} style={subBtnStyle}>
          🔇
        </button>
        <button onClick={() => handleControl('vol-up')} style={subBtnStyle}>
          🔊 +
        </button>
      </div>
    </div>
  )
}

const btnStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  fontSize: '1.5rem',
  cursor: 'pointer',
  transition: 'transform 0.1s',
  padding: '0'
}

const subBtnStyle = {
  background: '#333',
  border: 'none',
  color: '#ccc',
  padding: '5px 10px',
  borderRadius: '15px',
  fontSize: '0.8rem',
  cursor: 'pointer'
}
