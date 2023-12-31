registerLoadIn(scriptName, {
  load() {
    globalThis.urlTest = /^https?:\/\/(?:(www\.)?[-a-z0-9@:%._\+~#=]{1,256}\.[a-z0-9()]{1,6}\b|\[[:0-9]{2,}\])([-a-z0-9()@:%_\+.~#?&\/=]*)$/i
    globalThis.mentionMatch = /<(@|@!|@&|#|:|a:|t:|\/)((?<=@|@!|@&|#)\d+|(?<=:|a:|\/)([A-Za-z0-9_]+):(\d+)|(?<=t:)(-?\d+)(:([tTdDfFR]))?)>/g
  },
  unload() {
    delete globalThis.urlTest
    delete globalThis.mentionMatch
  }
})