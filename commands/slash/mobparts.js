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
        let heading
        for (const entity of category.entities) {
          if (entity.type === "heading") { heading = entity.text; continue }
          entities.push({ ...entity, heading })
          if (entity.variants) {
            for (const variant of entity.variants) {
              entities.push({ ...variant, heading })
            }
          }
        }
      }
      interaction.respond(entities.map(e => {
        const name = e.name ?? (e.file ?? e.id).toTitleCase(true)
        return {
          id: e.id,
          displayName: e.heading ? `${name} [${e.heading}]` : name
        }
      }).filter(e => e.id.includes(text) || e.displayName.toLowerCase().includes(text)).sort((a, b) => {
        if (a.displayName.startsWith(text) !== b.displayName.startsWith(text)) {
          return a.displayName.startsWith(text) ? -1 : 1
        }
        return a.displayName.localeCompare(b.displayName)
      }).slice(0, 25).map(e => ({ name: e.displayName, value: e.id })))
    }
  }]
})
