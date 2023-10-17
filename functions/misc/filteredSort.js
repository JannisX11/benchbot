registerFunction(scriptName, (array, string, count) => {
  string = string.toLowerCase()
  array = array.filter(e => e.toLowerCase().includes(string)).sort((a, b) => {
    a = a.toLowerCase()
    b = b.toLowerCase()
    if (a.startsWith(string) || string.startsWith(a)) {
      if (b.startsWith(string) || string.startsWith(b)) return a.localeCompare(b)
      return -1
    }
    if (b.startsWith(string) || string.startsWith(b)) return 1
    return a.localeCompare(b)
  })
  if (count) return array.slice(0, count)
  return array
})