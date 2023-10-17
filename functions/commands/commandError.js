registerFunction(scriptName, async (message, error) => {
  if (error.message === "Unknown interaction") return
  if (message.command && error.message === "Missing Permissions") return react(message, client.emotes.crossWhite)
  console.error(error)
  await sendError(message, {
    title: "An error occured while processing that command:",
    description: `\`\`\`${error.message}\`\`\``,
    footer: ["This error has been logged."]
  }).catch(() => {})
  try {
    let title
    if (message.command.type === "prefix") {
      if (message.guild) title = `Prefix command error in \`${message.guild.name}\` \`#${message.channel.name}\``
      else title = `Prefix command error in DMs with \`${message.author.username}\``
      await sendMessage(await getChannel(client.botChannels.errors), {
        title,
        fields: [
          ["Command", `\`\`${client.prefix}${message.command.name}\`\``, false],
          [`Message sent by \`${message.author.username}\``, message.content.limit(1024)],
          ["Error message", `\`\`${error.message.limit(1000)}\`\``, false],
          ["Stack", `\`\`\`${error.stack.toString().limit(1000)}\`\`\``, false]
        ],
        footer: [`ChannelID: ${message.channelId}\nMessage ID: ${message.id}\nUserID: ${message.author.id}`]
      })
    } else {
      if (message.member) title = `Application command command error in \`${message.guild.name}\` \`#${message.channel.name}\``
      else title = `Application command command error in DMs with \`${message.user.tag}\``
      await sendMessage(await getChannel(client.botChannels.errors), {
        title,
        fields: [
          ["Command", getFullCommand(message).toString().limit(1024), false],
          ["Run by", `\`${message.user.username}\``],
          ["Error message", `\`${error.message.limit(1000)}\``, false],
          ["Stack", `\`\`\`${error.stack.toString().limit(1000)}\`\`\``, false]
        ],
        footer: [`ChannelID: ${message.channelId} - UserID: ${message.user.id}`]
      })
    }
  } catch (e) {console.error(e)}
})