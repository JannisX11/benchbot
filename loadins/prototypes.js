registerLoadIn(scriptName, {
  load() {
    String.prototype.toTitleCase = toTitleCase
    String.prototype.limit = limit
  },
  unload() {
    delete String.prototype.toTitleCase
    delete String.prototype.limit
  }
})