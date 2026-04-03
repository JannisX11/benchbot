registerSlashCommand(scriptName, slashPath, {
  options: [{
    type: "string",
    name: "entity",
    description: "The entity",
    async autocomplete(interaction, text) {
      const cem = await cache.cem()
      const entities = []
      for (const category of cem.categories) {
        if (category.type) continue
        for (const entity of category.entities) {
          if (entity.type) continue
          entities.push(entity)
          if (entity.variants) {
            for (const variant of entity.variants) {
              entities.push(variant)
            }
          }
        }
      }
      interaction.respond(entities.map(e => ({
        id: e.id,
        displayName: e.name ?? (e.file ?? e.id).toTitleCase(true)
      })).filter(e => e.id.includes(text) || e.displayName.toLowerCase().includes(text)).sort((a, b) => {
        if (a.displayName.startsWith(text) !== b.displayName.startsWith(text)) {
          return a.displayName.startsWith(text) ? -1 : 1
        }
        return a.displayName.localeCompare(b.displayName)
      }).slice(0, 25).map(e => ({ name: e.displayName, value: e.id })))
    }
  }]
})
