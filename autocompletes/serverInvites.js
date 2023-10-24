registerAutocomplete(scriptName, async (interaction, text) => {
  text = text.toLowerCase()
  const invites = await Promise.all(db.guilds.serverInvites.all(config.guild).map(async (e, i) => ({ name: e[0].toTitleCase(true), value: e[0] })))
  if (!text) return interaction.respond(invites.sort((a, b) => a.name.localeCompare(b.name)))
  interaction.respond(invites.filter(e => e.name.toLowerCase().includes(text)).sort((a, b) => {
    a = a.name.toLowerCase()
    b = b.name.toLowerCase()
    if (a.startsWith(text)) {
      if (b.startsWith(text)) return a.localeCompare(b)
      return -1
    }
    if (b.startsWith(text)) return 1
    return a.localeCompare(b)
  }))
})