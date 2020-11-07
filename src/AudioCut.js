import FFmpeg from './ffmpeg'
import EventListener from './EventListener'

export default class AudioCut {
  constructor (file, canvas) {
    this.loading = true
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.audioFile = file
    this.loop = true
    this.interval = {
      start: 0,
      end: 0
    }
    this.mouseDown = false
    this.audio = new window.Audio(URL.createObjectURL(file))
    this.audio.addEventListener('loadeddata', () => {
      this.setIntervalEnd(this.audio.duration)
    })
    this.audio.addEventListener('canplaythrough', () => {
      this.audio.loop = this.loop
      this.loading = false
      this.eventListener.emit('load')
    })
    this.ffmpeg = new FFmpeg(file.name)
    this.ffmpeg.setInterval(this.interval)
    this.eventListener = new EventListener()
    this.tickInterval = setInterval(this.tick.bind(this), 10)

    this.canvas.addEventListener('mousedown', (event) => {
      this.mouseDown = true
      this.setAudioCurrentTime(this.positionToAudioTime(event.x))
    })
    window.addEventListener('mousemove', (event) => {
      if (this.mouseDown) {
        this.setAudioCurrentTime(this.positionToAudioTime(event.x))
      }
    })
    window.addEventListener('mouseup', (event) => {
      this.mouseDown = false
    })

    this.loadCanvas()
  }

  setIntervalStartNow () {
    this.setIntervalStart(this.audio.currentTime)
  }

  setIntervalEndNow () {
    this.setIntervalEnd(this.audio.currentTime)
  }

  positionToAudioTime (pos) {
    return ((pos - this.canvas.offsetLeft) / this.canvas.width) * this.audio.duration
  }

  loadCanvas () {
    this.canvas.style.width = '100%'
    this.canvas.style.height = '75px'

    this.updateCanvas()
  }

  toggleAudioPlayback () {
    if (this.audio.paused) {
      this.audio.play()
    } else {
      this.audio.pause()
    }
  }

  setLoop (val) {
    this.loop = !!val
    this.audio.loop = this.loop
  }

  tick () {
    this.ffmpeg.setInterval(this.interval) 
    this.eventListener.emit('update', {
      output: this.ffmpeg.generateCommand(),
      start: this.interval.start,
      end: this.interval.end,
      loading: this.loading,
      loop: this.loop,
      currentTime: Math.floor(this.audio.currentTime * 1000) / 1000
    })
    this.updateCanvas()
  }

  setVolume (vol) {
    this.audio.volume = vol
  }

  setAudioCurrentTime (time) {
    this.audio.currentTime = Math.max(Math.min(this.audio.duration, time), 0)
  }

  setIntervalStart (time) {
    if (time > this.interval.end) {
      this.interval.end = this.audio.duration
    }
    this.interval.start = Math.max(Math.min(this.audio.duration, time), 0)
  }

  setIntervalEnd (time) {
    if (time < this.interval.start) {
      this.interval.start = 0
    }
    this.interval.end = Math.max(Math.min(this.audio.duration, time), 0)
  }

  updateCanvas () {
    this.canvas.width = this.canvas.clientWidth
    /*
     * Background
     */
    this.ctx.fillStyle = '#f5f5f5'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    /*
     * Background for currentTime
     */
    this.ctx.fillStyle = '#96c0d4'
    this.ctx.fillRect(0, 0, this.durationToWidth(this.audio.currentTime), this.canvas.height)

    /*
     * Selection
     */
    this.ctx.fillStyle = '#96d4c0'
    const paddingTop = 0
    this.ctx.fillRect(
      this.durationToWidth(this.interval.start),
      this.canvas.height * paddingTop,
      this.durationToWidth(this.interval.end) - this.durationToWidth(this.interval.start),
      this.canvas.height - this.canvas.height * paddingTop)

    /*
     * Pin
     */
    this.ctx.fillStyle = '#d44a4a'
    const pinWidth = 1
    this.ctx.fillRect(
      this.durationToWidth(this.audio.currentTime) - (pinWidth * 0.5),
      0,
      pinWidth,
      this.canvas.height)
  }

  durationToWidth (duration) {
    return duration / this.audio.duration * this.canvas.width
  }

  on (event, listener) {
    this.eventListener.on(event, listener)
  }
}
