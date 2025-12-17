// src/renderer/src/App.jsx
import React, { useState } from 'react'
import './assets/main.css'
import CalendarView from './components/CalendarView'
import TodoSection from './components/TodoSection'
import MusicPlayer from './components/MusicPlayer'

function App() {
  const [isLocked, setIsLocked] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const isWindows = navigator.userAgent.includes('Windows')

  // 선택된 날짜 (기본값: 오늘 날짜 YYYY-MM-DD)
  // const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  return (
    <div className="app-container">
      {/* 상단 드래그 핸들 & 설정 버튼 */}
      <div
        className={`drag-handle ${!isLocked ? 'unlocked' : ''}`}
        style={{ justifyContent: isWindows ? 'flex-end' : 'flex-start' }}
      >
        <div style={{ position: 'relative' }}>
          <button className="setting-btn" onClick={() => setShowSettings(!showSettings)}>
            ⚙️
          </button>

          {showSettings && (
            <div
              className="setting-menu"
              style={{ right: isWindows ? 0 : 'auto', left: isWindows ? 'auto' : 0 }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <input type="checkbox" checked={isLocked} onChange={() => setIsLocked(!isLocked)} />
                <span>창 위치 고정하기</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 좌측 70%: 달력 영역 */}
      <div className="left-panel">
        {/* 달력 날짜 클릭 시 selectedDate 변경 */}
        <CalendarView onDateSelect={(date) => setSelectedDate(date)} selectedDate={selectedDate} />
      </div>

      {/* 우측 30%: 투두 + 뮤직 */}
      <div className="right-panel">
        <div className="todo-section">
          {/* 변경된 날짜를 투두 섹션에 전달 */}
          <TodoSection selectedDate={selectedDate} />
        </div>

        <div className="music-section" sytle={{ padding: 0 }}>
          <MusicPlayer />
        </div>
      </div>
    </div>
  )
}

export default App
