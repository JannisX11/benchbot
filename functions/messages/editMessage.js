registerFunction(scriptName, {
  editMessage(message, data) {
    if (!message) return
    if (data.embeds) return (message.interaction?.applicationId ? message.interaction.editReply.bind(message) : message.edit.bind(message))({
      content: data.message,
      embeds: data.embeds.map(e => makeEmbed(message, e)),
      components: data.components,
      files: data.files
    }).catch(e => {
      if (data.crash) throw Error
    })
    if (data.title || data.description || data.image || data.fields || data.author || data.field || data.url || data.timestamp || data.thumbnail) return (message.interaction?.applicationId ? message.interaction.editReply.bind(message) : message.edit.bind(message))({
      content: data.message,
      embeds: [makeEmbed(message, data)],
      components: data.components,
      files: data.files
    }).catch(e => {
      if (data.crash) throw Error
    })
    else return (message.interaction?.applicationId ? message.interaction.editReply.bind(message) : message.edit.bind(message))({
      content: data.message,
      components: data.components,
      files: data.files
    }).catch(e => {
      if (data.crash) throw Error
    })  
  },
  async editPrivateMessage(interaction, data) {
    if (data.embeds) return interaction.editReply({
      embeds: data.embeds.map(e => makeEmbed(interaction, e)),
      components: data.components,
      files: data.files,
      ephemeral: true
    }).catch(() => {})
    return interaction.editReply({
      embeds: [makeEmbed(interaction, data)],
      components: data.components,
      files: data.files,
      ephemeral: true
    }).catch(() => {})
  }
})