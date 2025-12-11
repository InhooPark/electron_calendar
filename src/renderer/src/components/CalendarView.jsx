import React, { useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import '../assets/calendar-custom.css'

export default function CalendarView({ onDateSelect, selectedDate }) {
  const calendarRef = useRef(null)

  // [수정 팁] 리렌더링 되어도 값이 유지되도록 useRef 사용 권장 (let 대신)
  // 기존 코드대로 let을 써도 당장은 동작하지만, useRef가 더 안정적입니다.
  const lastClickTimeRef = useRef(0)

  const currentMonthIndex = new Date().getMonth()
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

  const handleMonthClick = (monthIndex) => {
    const calendarApi = calendarRef.current.getApi()
    const now = new Date()
    const targetDate = new Date(now.getFullYear(), monthIndex, 1)
    calendarApi.gotoDate(targetDate)
  }

  // Double Click 구현 로직
  const handleDateClick = (info) => {
    const currentTime = new Date().getTime()
    const gap = currentTime - lastClickTimeRef.current // ref 값 사용

    if (gap < 300) {
      // 0.3초 이내 클릭 시 (더블 클릭)
      onDateSelect(info.dateStr)
    } else {
      // (선택 사항) 싱글 클릭 시에도 동작하게 하려면 유지,
      // 더블 클릭만 원하시면 이 else 블록을 비워두거나 삭제하세요.
      onDateSelect(info.dateStr)
    }
    lastClickTimeRef.current = currentTime // 시간 업데이트
  }
  const getDayClass = (arg) => {
    const cellDate =
      arg.date.getFullYear() +
      '-' +
      String(arg.date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(arg.date.getDate()).padStart(2, '0')
    if (cellDate === selectedDate) {
      return ['selected-date-cell']
    }
    return []
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%'
      }}
    >
      {/* 1. 상단 미니 이어(Year) 뷰 */}
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
          const isCurrentMonth = index === currentMonthIndex

          return (
            <div
              key={index}
              onClick={() => handleMonthClick(index)}
              style={{
                padding: '8px 0',
                textAlign: 'center',
                borderRadius: '5px',
                fontSize: '0.8rem',
                fontWeight: isCurrentMonth ? 'bold' : '600',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isCurrentMonth ? '#3788d8' : '#eee',
                transition: 'all 0.2s',
                backgroundColor: isCurrentMonth ? '#3788d8' : '#f8f9fa',
                color: isCurrentMonth ? '#ffffff' : '#555'
              }}
              onMouseOver={(e) => {
                if (!isCurrentMonth) {
                  e.currentTarget.style.backgroundColor = '#e3f2fd'
                  e.currentTarget.style.color = '#1976d2'
                }
              }}
              onMouseOut={(e) => {
                if (!isCurrentMonth) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa'
                  e.currentTarget.style.color = '#555'
                }
              }}
            >
              {month}
            </div>
          )
        })}
      </div>

      {/* 2. 메인 달력 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev',
            center: 'title',
            right: 'next'
          }}
          height="100%"
          contentHeight="auto"
          /* [핵심 수정] 여기에 handleDateClick을 연결해야 합니다! */
          dateClick={handleDateClick}
          dayCellClassNames={getDayClass}
        />
      </div>
    </div>
  )
}
