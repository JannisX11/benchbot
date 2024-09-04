registerLoadIn(scriptName, {
  load() {
    globalThis.fileSizeLimit = 8388608
  },
  unload() {
    delete globalThis.fileSizeLimit
  }
})