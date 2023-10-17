registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: "Get a list of bone names for each entity supported by OptiFine CEM",
    arguments: "[entity]"
  },
  aliases: ["cemparts", "mob", "cem", "customentitymodel"],
  arguments: ["?*entity"],
  async execute(message, args) {
    const cem = await cache.cem()
    const supported = cem.categories.find(e => e.name === "Supported").entities
    const legacy = cem.categories.find(e => e.name === "Legacy").entities
    const unsupported = cem.categories.find(e => e.name === "Unsupported")?.entities ?? []
    const unreleased = cem.categories.find(e => e.name === "Unreleased")?.entities ?? []
    const supportedEntities = supported.map(e => e.name ?? e)
    const legacyEntities = legacy.map(e => e.name ?? e)
    const unsupportedEntities = unsupported.map(e => e.name ?? e)
    const unreleasedEntities = unreleased.map(e => e.name ?? e)
    const footer = ["You can use the CEM Template Loader plugin to load a working template with the correct part names and pivot points"]
    if (!args[0]) {
      const fields = []
      if (unsupportedEntities.length) fields.push(["Unsupported", `\`${unsupportedEntities.join("`, `")}\``])
      if (unreleasedEntities.length) fields.push(["Unreleased", `\`${unreleasedEntities.join("`, `")}\``])
      return sendMessage(message, {
        title: "OptiFine Custom Entity Models",
        description: `Use \`${getCommandName(message)} [entity]\` to view the parts of an individual entity\n\n**Supported**\n\`${supportedEntities.join("`, `")}\``,
        field: ["Legacy", `\`${legacyEntities.join("`, `")}\``],
        footer,
        fields,
        components: [makeRow({
          buttons: [
            {
              label: "View online",
              url: "https://wynem.com/cem/"
            },
            {
              label: "CEM Template Loader",
              url: "https://ewanhowell.com/plugins/cem-template-loader/"
            }
          ]
        })]
      })
    }
    args[0] = args[0].toLowerCase().replace(/\s/g, "_")
    let entityData
    if (supportedEntities.includes(args[0])) {
      entityData = supported.find(e => (e.name ?? e) === args[0])
    } else if (legacyEntities.includes(args[0])) {
      entityData = legacy.find(e => (e.name ?? e) === args[0])
    } else if (unsupportedEntities.includes(args[0])) {
      entityData = unsupported.find(e => (e.name ?? e) === args[0])
      footer[0] = "This entity is currently NOT supported by OptiFine"
    } else if (unreleasedEntities.includes(args[0])) {
      entityData = unreleased.find(e => (e.name ?? e) === args[0])
      footer[0] = "This entity is currently unreleased"
    } else {
      const closest = closestMatch(args[0], supportedEntities.concat(legacyEntities, unsupportedEntities, unreleasedEntities), 0)
      const suggestion = await confirm(message, {
        title: `The entity \`${args[0].limit()}\` was not found`,
        description: `Did you mean \`${closest}\`?`,
        author: ["Error", client.icons.error],
        text: "Yes",
        cancel: "No"
      })
      if (suggestion[0] !== null) deleteMessage(suggestion[1])
      if (!suggestion[0]) return
      return client.prefixCommands.get("mobparts").execute(message, [closest])
    }
    const bones = JSON.parse(cem.models[entityData.model ?? entityData.name ?? entityData].model).models.map(e => e.part)
    const entityName = entityData.display_name ?? (entityData.name ?? entityData).replace(/_/g, " ").toTitleCase()
    sendMessage(message, {
      title: entityName,
      description: `\`${bones.join("`, `")}\``,
      thumbnail: `https://wynem.com/assets/images/minecraft/renders/${args[0]}.webp`,
      footer,
      components: [makeRow({
        buttons: [
          {
            label: "View online",
            url: `https://wynem.com/cem/?entity=${args[0]}`
          },
          {
            label: "Download template",
            url: `https://wynem.com/cem/?entity=${args[0]}&download`
          },
          {
            label: "Open in Blockbench",
            url: `https://web.blockbench.net/?plugins=cem_template_loader&model=${args[0]}&texture`
          }
        ]
      })]
    })
  }
})