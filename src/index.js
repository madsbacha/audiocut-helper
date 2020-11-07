import AudioCut from './AudioCut'
import './styles.css'

let audioInstance = null
let section = null
let lastOutput = null
const canvas = document.getElementById('audio-canvas')
const output = document.getElementById('output')
const loopCheckbox = document.getElementById('loop')
const intervalStartEl = document.getElementById('interval-start')
const intervalEndEl = document.getElementById('interval-end')
const currentTimeEl = document.getElementById('current-time')
const volumeEl = document.getElementById('volume')

function switchSection (sectionId) {
  if (section === sectionId) {
    return
  } else {
    section = sectionId
  }
  const sections = document.getElementsByTagName('section')
  for (const el of sections) {
    el.classList.add('hidden')
  }
  const elements = document.getElementsByClassName(sectionId)
  for (const el of elements) {
    el.classList.remove('hidden')
  }
}

window.addEventListener('load', () => {
  switchSection('fileselection-section')

  /**
   * Audio file upload
   */
  const audiofile = document.getElementById('audiofile')
  audiofile.addEventListener('change', (event) => {
    switchSection('loading-section')
    const file = event.target.files[0]
    audioInstance = new AudioCut(file, canvas)
    audioInstance.on('load', () => {
      switchSection('audio-section')
    })
    audioInstance.on('update', (payload) => {
      if (lastOutput !== payload.output) {
        lastOutput = payload.output
        output.innerHTML = payload.output
      }
      intervalStartEl.innerHTML = payload.start
      intervalEndEl.innerHTML = payload.end
      loopCheckbox.checked = payload.loop
      currentTimeEl.innerHTML = payload.currentTime
    })
    loopCheckbox.addEventListener('change', (event) => {
      audioInstance.setLoop(event.target.checked)
    })
    audioInstance.setVolume(parseInt(volumeEl.value) / 100)
    volumeEl.addEventListener('input', (event) => {
      audioInstance.setVolume(parseInt(event.target.value) / 100)
    })
  })

  /**
   * Back buttons
   */
  const backButtons = document.getElementsByClassName('back')
  for (const btn of backButtons) {
    btn.addEventListener('click', (event) => {
      switchSection(event.target.getAttribute('data-id'))
    })
  }

  /**
   * Shortcuts
   */
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      audioInstance.toggleAudioPlayback()
    } else if (event.key === 'i') {
      audioInstance.setIntervalStartNow()
    } else if (event.key === 'o') {
      audioInstance.setIntervalEndNow()
    }
  })
})
