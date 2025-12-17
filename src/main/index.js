import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const DATA_PATH = path.join(app.getPath('userData'), 'todo-data.json')

// data load
ipcMain.handle('read-todos', async () => {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return null
    }
    const data = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Failed to read todos:', err)
    return null
  }
})
// data save
ipcMain.handle('save-todos', async (event, data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Failed to save todos:', err)
    return false
  }
})
// media key control
ipcMain.handle('media-control', async (event, action) => {
  // Windows or macOS
  const isWin = process.platform === 'win32'
  let command = ''

  if (isWin) {
    // Windows
    // 179: play/pause, 178: stop, 177: prev, 176: next
    // 175: volup, 174: voldown, 173: mute
    let keyCode = 0
    switch (action) {
      case 'play-pause':
        keyCode = 179
        break
      case 'next':
        keyCode = 176
        break
      case 'prev':
        keyCode = 177
        break
      case 'vol-up':
        keyCode = 175
        break
      case 'vol-down':
        keyCode = 174
        break
      case 'mute':
        keyCode = 173
        break
    }
    if (keyCode > 0) {
      command = `powershell -c "$wshell = New-Object -ComObject WScript.Shell; $wShell.SendKeys([char]${keyCode})"`
    }
  } else {
    // macOS
    // 100: play/pause, 101: prev, 98: next,
    const targetApp = 'Spotify'
    let script = ''
    switch (action) {
      // playpause: 재생/일시정지 토글
      case 'play-pause':
        script = `tell application "${targetApp}" to playpause`
        break

      // 트랙 이동
      case 'next':
        script = `tell application "${targetApp}" to next track`
        break
      case 'prev':
        script = `tell application "${targetApp}" to previous track`
        break

      // 볼륨 조절 (시스템 전체 볼륨)
      case 'vol-up':
        script = 'set volume output volume (output volume of (get volume settings) + 10)'
        break
      case 'vol-down':
        script = 'set volume output volume (output volume of (get volume settings) - 10)'
        break
      case 'mute':
        script = 'set volume output muted not (output muted of (get volume settings))'
        break
    }
    if (script) {
      command = `osascript -e '${script}'`
    }
  }
  if (command) {
    exec(command, (error) => {
      if (error) console.error(`Media control failed: ${error}`)
    })
  }
})
// Media App Power
ipcMain.handle('app-control', async (event, { action, appName }) => {
  const isWin = process.platform === 'win32'
  let command = ''

  // Windows exeName(Spotify), macOS appName(Spotify)
  const targetApp = appName || (isWin ? 'Spotify' : 'Spotify')
  if (action === 'open') {
    if (isWin) command = `start "" "${targetApp}"`
    else command = `open -a "${targetApp}"`
  } else if (action === 'close') {
    if (isWin) command = `taskkill /IM "${targetApp}.exe" /F`
    else command = `killall "${targetApp}"`
  }
  exec(command, (error) => {
    if (error) console.error(`App control failed: ${error}`)
  })
})

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,

    frame: false,
    transparent: true,
    // resizable: false,
    skipTaskbar: true,
    hasShadow: false,

    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // 윈도우(창)에서 항상 맨 뒤로 보내려고 시도하기
    // 데스크탑위젯과 같이 폴더, 파일보다 아래로 가려면 electron 자체적으론 어려움
    // 때문에 바탕화면에 배치하더라도 폴더나 파일과 겹치지 않게 배치해야하는 단점
    mainWindow.setAlwaysOnTop(false)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
