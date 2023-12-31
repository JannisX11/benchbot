const map = {
  "<id:browse>": "Browse Channels",
  "<id:customize>": "Customise Community",
  "<id:guide>": "Server Guide",
  "<id:home>": "Server Guide"
}

registerFunction(scriptName, async (guild, message) => {
  const matches = Array.from(message.matchAll(mentionMatch))
  const replacements = await Promise.all(matches.map(async m => {
    try {
      if (m[1] === "@" || m[1] === "@!") {
        if (guild) try {
          const member = await getMember(guild, m[2])
          return `@${member.displayName}`
        } catch {}
        const user = await getUser(m[2])
        return `@${user.username}`
      }
      if (m[1] === "@&" && guild) return `@${(await getRole(guild, m[2])).name}`
      if (m[1] === "#") return `#${(await getChannel(m[2])).name}`
      if (m[1] === ":" || m[1] === "a:") return m[3]
      if (m[1] === "t:") return new Date(parseInt(m[5])*1000).toUTCString().replace("GMT", "UTC")
      if (m[1] === "/") return `/${m[3]}`
      return m[0]
    } catch {
      return m[0]
    }
  }))
  for (const [i, m] of matches.entries()) message = message.replace(m[0], replacements[i])
  for (const [src, dst] of Object.entries(map)) message = message.replaceAll(src, dst)
  return message
})