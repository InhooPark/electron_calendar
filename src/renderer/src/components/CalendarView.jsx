import React, { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import '../assets/calendar-custom.css'

export default function CalendarView({ onDateSelect, selectedDate, dailyTodos }) {
  const calendarRef = useRef(null)
  const lastClickTimeRef = useRef(0)
  const [activeMonthIndex, setActiveMonthIndex] = useState(new Date().getMonth())

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const calendarEvents = Object.keys(dailyTodos || {}).flatMap((dateKey) =>
    dailyTodos[dateKey].map((todo) => ({
      title: todo.text,
      date: dateKey,
      allDay: true,
      backgroundColor: todo.done ? '#777' : '#ff4d4d',
      borderColor: todo.done ? '#777' : '#ff4d4d'
    }))
  )

  const handleMonthClick = (monthIndex) => {
    setActiveMonthIndex(monthIndex)

    const calendarApi = calendarRef.current.getApi()
    const now = new Date()
    const targetDate = new Date(now.getFullYear(), monthIndex, 1)
    calendarApi.gotoDate(targetDate)
  }
  const handleTodayClick = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    setActiveMonthIndex(now.getMonth())
    onDateSelect(todayStr)
    const calendarApi = calendarRef.current.getApi()
    calendarApi.today()
  }
  const handleDateClick = (info) => {
    const currentTime = new Date().getTime()
    const gap = currentTime - lastClickTimeRef.current
    if (gap < 300) {
      onDateSelect(info.dateStr)
    } else {
      onDateSelect(info.dateStr)
    }
    lastClickTimeRef.current = currentTime
  }

  const getDayClass = (arg) => {
    const cellDate =
      arg.date.getFullYear() +
      '-' +
      String(arg.date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(arg.date.getDate()).padStart(2, '0')
    if (cellDate === selectedDate) return ['selected-date-cell']
    return []
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '5px',
          marginBottom: '15px',
          flexShrink: 0
        }}
      >
        {months.map((month, index) => {
          const isActive = index === activeMonthIndex

          return (
            <div
              key={index}
              onClick={() => handleMonthClick(index)}
              className={`month-btn ${isActive ? 'active' : ''}`}
            >
              {month}
            </div>
          )
        })}
      </div>

      <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev', center: 'myTodayBtn title', right: 'next' }}
          customButtons={{
            myTodayBtn: {
              text: '📅',
              click: handleTodayClick
            }
          }}
          buttonIcons={false}
          buttonText={{ prev: '‹', next: '›', today: 'Today' }}
          height="100%"
          expandRows={true}
          dayMaxEvents={true}
          handleWindowResize={true}
          stickyHeaderDates={true}
          dateClick={handleDateClick}
          dayCellClassNames={getDayClass}
          events={calendarEvents}
        />
      </div>
    </div>
  )
}
