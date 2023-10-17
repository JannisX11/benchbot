registerFunction(scriptName, {
  async sendMessage(message, data) {
    if (!message) return
    const channel = message.channel ?? message
    if (channel.archived && channel.locked && !hasPerm(channel.guild.members.me, "ManageThreads", channel)) {
      if (data.error) sendError(data.error, {
        title: "Unable to send message",
        description: `The channel ${channel} is both archived and locked`
      })
      return
    }
    if (data.deletable && !(message.command.application && data.ephemeral)) {
      data.components ??= []
      data.components.push(makeRow({
        buttons: [{
          emoji: client.emotes.binWhite,
          style: "red",
          customId: `delete_${message.author.id}`
        }]
      }))
    }
    if (data.content || data.embedless) {
      if (data.processing) try {
        return await (data.processing.edit ? data.processing.edit.bind(data.processing) : !data.processing.editReply ? message.editReply.bind(message) : data.processing.deferred || data.processing.replied ? data.processing.editReply.bind(data.processing) : data.processing.reply.bind(data.processing))({
          allowedMentions: data.ping ? { repliedUser: true, parse: ["users", "roles"] } : { parse: ["users"] },
          content: data.content,
          files: data.files,
          components: data.components,
          embeds: [],
          fetchReply: data.fetch,
          ephemeral: data.ephemeral
        })
      } catch {}
      try {
        return await (message.deferred || message.replied ? message.editReply.bind(message) : message.reply.bind(message))({
          allowedMentions: data.ping ? { repliedUser: true, parse: ["users", "roles"] } : { parse: ["users"] },
          content: data.content,
          files: data.files,
          components: data.components,
          fetchReply: data.fetch,
          ephemeral: data.ephemeral
        })
      } catch {
        return await channel.send({
          content: data.content,
          files: data.files,
          components: data.components,
          fetchReply: data.fetch,
          ephemeral: data.ephemeral
        })
      }
    }
    if (data.embeds) {
      const embeds = data.embeds.map(e => makeEmbed(message, e))
      if (data.processing) try {
        return await (data.processing.edit ? data.processing.edit.bind(data.processing) : !data.processing.editReply ? message.editReply.bind(message) : data.processing.deferred || data.processing.replied ? data.processing.editReply.bind(data.processing) : data.processing.reply.bind(data.processing))({
          content: data.message,
          embeds,
          files: data.files,
          components: data.components,
          fetchReply: data.fetch,
          ephemeral: data.ephemeral
        })
      } catch (err) {
        console.log(err)
      }
      try {
        return await (message.deferred || message.replied ? message.editReply.bind(message) : message.reply.bind(message))({
          content: data.message,
          allowedMentions: data.ping ? { repliedUser: true, parse: ["users", "roles"] } : { parse: ["users"] },
          embeds,
          files: data.files,
          components: data.components,
          fetchReply: data.fetch,
          ephemeral: data.ephemeral
        })
      } catch {
        return await channel.send({
          content: data.message,
          embeds,
          files: data.files,
          components: data.components,
          fetchReply: data.fetch,
          ephemeral: data.ephemeral
        })
      }
    }
    const embed = makeEmbed(message, data)
    if (data.processing) try {
      return await (data.processing.edit ? data.processing.edit.bind(data.processing) : !data.processing.editReply ? message.editReply.bind(message) : data.processing.deferred || data.processing.replied ? data.processing.editReply.bind(data.processing) : data.processing.reply.bind(data.processing))({
        content: data.message,
        embeds: [embed],
        files: data.files,
        components: data.components,
        fetchReply: data.fetch,
        ephemeral: data.ephemeral
      })
    } catch {}
    try {
      return await (message.deferred || message.replied ? message.editReply.bind(message) : message.reply.bind(message))({
        allowedMentions: data.ping ? { repliedUser: true, parse: ["users", "roles"] } : { parse: ["users"] },
        content: data.message,
        embeds: [embed],
        files: data.files,
        components: data.components,
        fetchReply: data.fetch,
        ephemeral: data.ephemeral
      })
    } catch {
      return await channel.send({
        content: data.message,
        embeds: [embed],
        files: data.files,
        components: data.components,
        fetchReply: data.fetch,
        ephemeral: data.ephemeral
      })
    }
  },
  sendPrivateMessage(interaction, data) {
    if (data.embedless || data.content) return interaction.reply({
      content: data.content,
      components: data.components,
      ephemeral: true
    })
    if (data.embeds) return interaction.reply({
      embeds: data.embeds.map(e => makeEmbed(interaction, e)),
      components: data.components,
      ephemeral: true
    })
    return interaction.reply({
      embeds: [makeEmbed(interaction, data)],
      components: data.components,
      ephemeral: true
    })
  }
})