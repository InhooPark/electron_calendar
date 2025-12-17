import React, { useState, useEffect } from 'react'

export default function TodoSection({
  selectedDate,
  dailyTodos,
  setDailyTodos,
  routines,
  setRoutines,
  history,
  setHistory
}) {
  // === 상태 관리 ===
  // const [dailyTodos, setDailyTodos] = useState({})
  // const [routines, setRoutines] = useState([])
  // const [history, setHistory] = useState({})
  // const [isLoaded, setIsLoaded] = useState(false)

  const [inputText, setInputText] = useState('')
  const [inputType, setInputType] = useState('daily')
  const [routineDays, setRoutineDays] = useState([0, 1, 2, 3, 4, 5, 6])

  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // useEffect(() => {
  //   async function loadData() {
  //     if (window.api) {
  //       const data = await window.api.readTodos()
  //       if (data) {
  //         setDailyTodos(data.daily || {})
  //         setRoutines(data.routines || [])
  //         setHistory(data.history || {})
  //       }
  //     }
  //     setIsLoaded(true)
  //   }
  //   loadData()
  // }, [])

  // useEffect(() => {
  //   if (!isLoaded) return
  //   const dataToSave = { daily: dailyTodos, routines: routines, history: history }
  //   if (window.api) window.api.saveTodos(dataToSave)
  // }, [dailyTodos, routines, history, isLoaded])

  // const toggleDay = (dayIndex) => {
  //   setRoutineDays((prev) => {
  //     if (prev.includes(dayIndex)) return prev.filter((d) => d !== dayIndex)
  //     else return [...prev, dayIndex].sort()
  //   })
  // }

  const toggleDay = (dayIndex) => {
    setRoutineDays((prev) => {
      if (prev.includes(dayIndex)) return prev.filter((d) => d !== dayIndex)
      else return [...prev, dayIndex].sort()
    })
  }

  const handleAddTodo = () => {
    if (!inputText.trim()) return

    if (inputType === 'daily') {
      const newTodo = { id: Date.now(), text: inputText, done: false, type: 'daily' }
      setDailyTodos((prev) => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), newTodo]
      }))
    } else {
      if (routineDays.length === 0) {
        alert('Please select at least one day of the week.')
        return
      }
      const newRoutine = { id: Date.now(), text: inputText, days: routineDays, type: 'routine' }
      setRoutines((prev) => [...prev, newRoutine])
    }
    setInputText('')
  }

  const toggleTodo = (todo) => {
    if (todo.type === 'daily') {
      setDailyTodos((prev) => ({
        ...prev,
        [selectedDate]: prev[selectedDate].map((t) =>
          t.id === todo.id ? { ...t, done: !t.done } : t
        )
      }))
    } else {
      const key = `${selectedDate}_${todo.id}`
      setHistory((prev) => {
        const newHistory = { ...prev }
        if (newHistory[key]) delete newHistory[key]
        else newHistory[key] = true
        return newHistory
      })
    }
  }

  const handleDelete = (todo) => {
    if (!confirm('Delete it?')) return

    if (todo.type === 'daily') {
      setDailyTodos((prev) => ({
        ...prev,
        [selectedDate]: prev[selectedDate].filter((t) => t.id !== todo.id)
      }))
    } else {
      setRoutines((prev) => prev.filter((r) => r.id !== todo.id))
    }
  }

  const startEditing = (todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }
  const saveEdit = (todo) => {
    if (!editText.trim()) return

    if (todo.type === 'daily') {
      setDailyTodos((prev) => ({
        ...prev,
        [selectedDate]: prev[selectedDate].map((t) =>
          t.id === todo.id ? { ...t, text: editText } : t
        )
      }))
    } else {
      setRoutines((prev) => prev.map((r) => (r.id === todo.id ? { ...r, text: editText } : r)))
    }
    setEditingId(null)
  }
  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }
  const currentDailyTodos = dailyTodos[selectedDate] || []
  const currentDayOfWeek = new Date(selectedDate).getDay()
  const currentRoutines = routines.filter((r) => r.days.includes(currentDayOfWeek))

  const displayList = [
    ...currentDailyTodos,
    ...currentRoutines.map((r) => ({ ...r, done: !!history[`${selectedDate}_${r.id}`] }))
  ]

  const totalCount = displayList.length
  const doneCount = displayList.filter((t) => t.done).length
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
      <h2 style={{ marginBottom: '10px' }}>
        📅 {selectedDate} <span style={{ fontSize: '0.6em', color: '#888' }}>To-do</span>
      </h2>
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            marginBottom: '5px'
          }}
        >
          <span>Achievement Rate</span>
          <span style={{ fontWeight: 'bold', color: progress === 100 ? '#ff4d4d' : '#333' }}>
            {progress}%
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            background: '#eee',
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: progress === 100 ? '#ff4d4d' : '#ff8d8d',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px' }}>
        {displayList.length === 0 ? (
          <p style={{ color: '#ccc', textAlign: 'center', marginTop: '20px' }}>
            There is nothing to do
          </p>
        ) : (
          displayList.map((todo, idx) => {
            const isEditing = editingId === todo.id

            return (
              <div
                key={`${todo.type}-${todo.id}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  marginBottom: '8px',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flex: 1, gap: '5px' }}>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(todo)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                    />
                    <button
                      onClick={() => saveEdit(todo)}
                      style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                    >
                      💾
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                    >
                      ❌
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleTodo(todo)}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight: '10px',
                        cursor: 'pointer'
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        textDecoration: todo.done ? 'line-through' : 'none',
                        color: todo.done ? '#bbb' : '#333',
                        cursor: 'pointer'
                      }}
                      onDoubleClick={() => startEditing(todo)}
                      title="더블 클릭하여 수정"
                    >
                      {todo.text}
                    </span>

                    <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: todo.type === 'routine' ? '#e3f2fd' : '#fff3e0',
                          color: todo.type === 'routine' ? '#1976d2' : '#f57c00'
                        }}
                      >
                        {todo.type === 'routine' ? 'R' : 'D'}
                      </span>

                      <button
                        onClick={() => startEditing(todo)}
                        style={{
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none',
                          opacity: 0.5
                        }}
                        title="수정"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => handleDelete(todo)}
                        style={{
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none',
                          opacity: 0.5
                        }}
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>

      <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
            style={{
              padding: '5px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              height: '30px'
            }}
          >
            <option value="daily">Daily</option>
            <option value="routine">Routine</option>
          </select>

          {inputType === 'routine' && (
            <div style={{ display: 'flex', gap: '2px' }}>
              {dayLabels.map((day, idx) => {
                const isSelected = routineDays.includes(idx)
                return (
                  <button
                    key={idx}
                    onClick={() => toggleDay(idx)}
                    style={{
                      width: '40px',
                      height: '24px',
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: isSelected ? '#1976d2' : '#ddd',
                      background: isSelected ? '#1976d2' : 'white',
                      color: isSelected ? 'white' : '#888',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '5px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              // e.key === 'Enter' && handleAddTodo()}}
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleAddTodo()
              }
            }}
            placeholder="What are you doing today?"
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button
            onClick={handleAddTodo}
            style={{
              padding: '0 15px',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
