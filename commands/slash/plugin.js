registerSlashCommand(scriptName, slashPath, {
  options: [{
    name: "name",
    description: "The plugin name",
    async autocomplete(interaction, text) {
      if (text) return interaction.respond(filteredSort(Object.values(await cache.plugins()).map(e => e.title), text, 25).map(e => ({ name: e, value: e })))
      interaction.respond(Object.values(await cache.plugins()).sort((a, b) => b.stats - a.stats).slice(0, 25).map(e => ({ name: e.title, value: e.title })))
    }
  }]
})