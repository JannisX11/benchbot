registerLoadIn(scriptName, {
  async load() {
    client.emotes = {}
    const emojis = await client.application.emojis.fetch()
    for (const emoji of emojis) {
      client.emotes[emoji[1].name.replace(/(_\w)/g, match => match[1].toUpperCase())] = emoji[1].id
    }
  },
  unload: () => delete client.emotes
})