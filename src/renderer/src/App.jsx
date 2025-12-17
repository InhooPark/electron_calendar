// src/renderer/src/App.jsx
import React, { useEffect, useState } from 'react'
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

  const [dailyTodos, setDailyTodos] = useState({})
  const [routines, setRoutines] = useState([])
  const [history, setHistory] = useState({})
  const [isLoaded, setIsLoaded] = useState(false)

  // init data load
  useEffect(() => {
    async function loadData() {
      if (window.api) {
        const data = await window.api.readTodos()
        if (data) {
          setDailyTodos(data.daily || {})
          setRoutines(data.routines || [])
          setHistory(data.history || {})
        }
      }
      setIsLoaded(true)
    }
    loadData()
  }, [])
  // data auto save
  useEffect(() => {
    if (!isLoaded) return
    const dataToSave = { datily: dailyTodos, routines: routines, history: history }
    if (window.api) window.api.saveTodos(dataToSave)
  }, [dailyTodos, routines, history, isLoaded])

  return (
    <div className="app-container">
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
                <span>Pin a window</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="left-panel">
        <CalendarView
          onDateSelect={(date) => setSelectedDate(date)}
          selectedDate={selectedDate}
          dailyTodos={dailyTodos}
        />
      </div>

      <div className="right-panel">
        <div className="todo-section">
          <TodoSection
            selectedDate={selectedDate}
            dailyTodos={dailyTodos}
            setDailyTodos={setDailyTodos}
            routines={routines}
            setRoutines={setRoutines}
            history={history}
            setHistory={setHistory}
          />
        </div>

        <div className="music-section" sytle={{ padding: 0 }}>
          <MusicPlayer />
        </div>
      </div>
    </div>
  )
}

export default App
