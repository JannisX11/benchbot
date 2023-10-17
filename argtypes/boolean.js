registerArgType(scriptName, item => {
  if (item === true || item === false) return item
  if (item.match(/^(1|0|true|false|on|off|yes|no|y|n)$/i)) {
    return !item.match(/^(0|false|off|no|n)$/i)
  }
})