registerFunction(scriptName, {
  react(message, emoji) {
    if (message.command?.type === "slash") return sendMessage(message, {
      content: emoji.length >= 17 ? `<:e:${emoji}>` : emoji,
      fetch: true
    })
    else if (!message.guild || (message.guild && permChecks.react(message.guild.members.me, message.channel))) return message.react(emoji).catch(() => {})
  },
  async timedReact(message, reaction, time = 5000) {
    reaction = await react(message, reaction)
    await new Promise(fulfil => setTimeout(fulfil, time))
    if (message.command?.type === "slash") deleteMessage(reaction)
    else if (reaction) reaction.users.remove().catch(() => {})
  }
})