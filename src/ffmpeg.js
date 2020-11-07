export default class FFmpeg {
  constructor (filename = 'unknown.mp3') {
    this.setFileName(filename)
    this.interval = {
      start: 0,
      end: 0
    }
  }

  setFileName (filename) {
    this.filename = filename
    this.filename_output = this.generateOutputFilename(filename)
  }

  setInterval (interval) {
    this.interval = interval
  }

  generateCommand () {
    const { hours, minutes, seconds, milliseconds } = this.expandSeconds(this.interval.start)
    const millisecondsFormatted = milliseconds.toString().substr(2)
    const duration = Math.floor((this.interval.end - this.interval.start) * 1000) / 1000
    return `ffmpeg -i "${this.filename}" -ss ${hours}:${minutes}:${seconds}.${millisecondsFormatted} -t ${duration} "${this.filename_output}"`
  }

  expandSeconds (time) {
    const hours = Math.floor(time / 3600)
    time %= 3600
    const minutes = Math.floor(time / 60)
    time %= 60
    const seconds = Math.floor(time)
    const milliseconds = Math.floor((time - seconds) * 1000) / 1000
    return { hours, minutes, seconds, milliseconds }
  }

  generateOutputFilename (filename, append = '-cut') {
    return this.addToFileName(filename, append)
  }

  addToFileName (filename, newString) {
    const lastDot = filename.lastIndexOf('.')
    return filename.substring(0, lastDot) + newString + filename.substring(lastDot)
  }
}
