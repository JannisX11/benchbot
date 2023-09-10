registerFunction(scriptName, async (guild, message) => {
  if (!message) return
  const parts = Array.from(message.matchAll(/(?<!\\)["“”].*?(?<!(?<!\\)\\)["“”]|[^\s,.!?]+/gd)).map(e => {
    e[0] = e[0].replace(/\\\\/g, '\\__ESCAPED_BACKSLASH__')
    if (e[0].match(/^["“”].*?(?<!(?<!\\)\\)["“”]$/)) e[0] = e[0].slice(1, -1)
    e[0] = e[0].replace(/\\(["“”])/g, "$1").replace(/\\__ESCAPED_BACKSLASH__/g, "\\")
    return e
  })
  const replacements = []
  const pings = parts.filter(e => e[0].startsWith("@"))
  for (const ping of pings) {
    const name = ping[0].slice(1).toLowerCase()
    const member = guild.members.cache.find(e => e.user.username.toLowerCase() === name || e.nickname?.toLowerCase() === name || e.user.tag.toLowerCase() === name)
    if (member) replacements.push([ping, member.toString()])
    else {
      const role = guild.roles.cache.find(e => e.name.toLowerCase() === name)
      if (role) replacements.push([ping, role.toString()])
    }
  }
  const channels = parts.filter(e => e[0].startsWith("#"))
  for (const c of channels) {
    const name = c[0].slice(1).toLowerCase()
    const channel = guild.channels.cache.find(e => e.name.toLowerCase() === name)
    if (channel) replacements.push([c, channel.toString()])
  }
  const emojis = parts.filter(e => e[0].startsWith(":") && e[0].endsWith(":"))
  for (const e of emojis) {
    const name = e[0].slice(1, -1).toLowerCase()
    const emoji = guild.emojis.cache.find(e => e.name.toLowerCase() === name)
    if (emoji) replacements.push([e, emoji.toString()])
  }
  for (const replacement of replacements.sort((a, b) => b[0].indices[0][0] - a[0].indices[0][0])) message = `${message.slice(0, replacement[0].indices[0][0])}${replacement[1]}${message.slice(replacement[0].indices[0][1])}`
  return message
})