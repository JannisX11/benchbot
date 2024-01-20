const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const map = {
  "<id:browse>": "Browse Channels",
  "<id:customize>": "Customise Community",
  "<id:guide>": "Server Guide",
  "<id:home>": "Server Guide"
}

function relativeTime(epoch) {
  const time = Date.now() / 1000
  const delta = time - epoch
  if (delta < 2 && delta > -2) return (delta >= 0 ? "just " : "") + "now"
  if (delta < 60 && delta > -60) return delta >= 0 ? Math.floor(delta) + " seconds ago" : "in " + Math.floor(-delta) + " seconds"
  if (delta < 120 && delta > -120) return delta >= 0 ? "about a minute ago" : "in about a minute"
  if (delta < 3600 && delta > -3600) return delta >= 0 ? Math.floor(delta / 60) + " minutes ago" : "in " + Math.floor(-delta / 60) + " minutes"
  if (delta < 7200 && delta > -7200) return delta >= 0 ? "about an hour ago" : "in about an hour"
  if (delta < 86400 && delta > -86400) return delta >= 0 ? Math.floor(delta / 3600) + " hours ago" : "in " + Math.floor(-delta / 3600) + " hours"
  if (delta < 172800 && delta > -172800) return delta >= 0 ? "1 day ago" : "in 1 day"
  if (delta < 2505600 && delta > -2505600) return delta >= 0 ? Math.floor(delta / 86400) + " days ago" : "in " + Math.floor(-delta / 86400) + " days"
  if (delta < 5184000 && delta > -5184000) return delta >= 0 ? "about a month ago" : "in about a month"
  const currentYear = new Date().getUTCFullYear()
  const epochYear = new Date(epoch * 1000).getUTCFullYear()
  const monthDelta = 12 * currentYear + new Date(time * 1000).getUTCMonth() + 1 - 12 * epochYear - new Date(epoch * 1000).getUTCMonth() - 1
  if (monthDelta < 12 && monthDelta > -12) return monthDelta >= 0 ? monthDelta + " months ago" : "in " + -monthDelta + " months";
  const yearDelta = currentYear - epochYear
  return yearDelta < 2 && yearDelta > -2 ? yearDelta >= 0 ? "a year ago" : "in a year" : yearDelta >= 0 ? yearDelta + " years ago" : "in " + -yearDelta + " years"
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
      if (m[1] === "t:") {
        const date = new Date(parseInt(m[5]) * 1000)
        switch (m[7]) {
          case "t":
            return `${date.getUTCHours().toString().padStart(2, 0)}:${date.getUTCMinutes().toString().padStart(2, 0)} UTC`
          case "T":
            return `${date.getUTCHours().toString().padStart(2, 0)}:${date.getUTCMinutes().toString().padStart(2, 0)}:${date.getUTCSeconds().toString().padStart(2, 0)} UTC`
          case "d":
            return `${date.getUTCDate().toString().padStart(2, 0)}/${(date.getUTCMonth() + 1).toString().padStart(2, 0)}/${date.getUTCFullYear()} UTC`
          case "D":
            return `${date.getUTCDate().toString().padStart(2, 0)} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} UTC`
          case "f":
          case undefined:
            return `${date.getUTCDate().toString().padStart(2, 0)} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} ${date.getUTCHours().toString().padStart(2, 0)}:${date.getUTCMinutes().toString().padStart(2, 0)} UTC`
          case "F":
            return `${days[date.getUTCDay()]}, ${date.getUTCDate().toString().padStart(2, 0)} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} ${date.getUTCHours().toString().padStart(2, 0)}:${date.getUTCMinutes().toString().padStart(2, 0)} UTC`
          case "R":
            return relativeTime(m[5])
        }
      }
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