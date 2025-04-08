registerSlashCommand(scriptName, slashPath, {
  options: [{
    type: "string",
    name: "entity",
    description: "The entity",
    async autocomplete(interaction, text) {
      const cem = await cache.cem()
      interaction.respond([
        cem.categories.find(e => e.name === "Supported").entities,
        cem.categories.find(e => e.name === "Legacy").entities,
        cem.categories.find(e => e.name === "Unsupported")?.entities ?? [],
        cem.categories.find(e => e.name === "Unreleased")?.entities ?? []
      ].flat().map(e => {
        if (typeof e === "string") return {
          name: e,
          display_name: e.toTitleCase(true)
        }
        if (!e.display_name && e.name) e.display_name = e.name.toTitleCase(true)
        return e
      }).filter(e => e.name?.includes(text) || e.display_name?.toLowerCase().includes(text)).sort((a, b) => {
        a = a.display_name
        b = b.display_name
        if (a.startsWith(text)) {
          if (b.startsWith(text)) return a.localeCompare(b)
          return -1
        }
        if (b.startsWith(text)) return 1
        return a.localeCompare(b)
      }).slice(0, 25).map(e => ({ name: e.display_name, value: e.name })))
    }
  }]
})