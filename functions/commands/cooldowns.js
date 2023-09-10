registerFunction(scriptName, {
  async cooldownCheck(message, command) {
    const id = command.cooldownType === "guild" ? message.guildId ?? message.channelId : message.author.id
    const now = Date.now()
    if (command.cooldowns[id]) {
      if (now - command.cooldowns[id] > command.cooldown * 1000) {
        command.cooldowns[id] = now
      } else {
        sendError(message, {
          title: "Cooldown active",
          description: `Try again in \`${Math.ceil((command.cooldown - (now - command.cooldowns[id]) / 1000) * 10) / 10}\` seconds`,
          ignoreCooldown: true
        })
        return
      }
    } else {
      command.cooldowns[id] = now
    }
    if (message.guild) {
      const ids = [message.channel.id, message.channel.parentId]
      if (isType.channel(message.channel, "Thread")) ids.push((await getChannel(message.channel.parentId)).parentId)
      if (ids.some(e => config.channels.infiniteCommands.includes(e))) return true
      if (message.command.command === "archive" && ids.includes(config.channels.showcase)) return true
      if (isMod(message.member) || message.member.roles.cache.has(config.roles.vip)) return true
      if (client.cooldowns[message.author.id]?.timedout) {
        sendMessage(message, {
          title: "Please move channels",
          description: `Please either move to <#${config.channels.commands}>, or DM me to use more commands.\n\nThis helps to prevent filling channels with random bot messages. If you use DMs, it gives you an easy way to quickly see previous commands you have run.`,
          ephemeral: true
        })
        return
      }
      client.cooldowns[message.author.id] ??= { count: 0 }
      client.cooldowns[message.author.id].count++
      setTimeout(() => {
        client.cooldowns[message.author.id].count--
        if (!client.cooldowns[message.author.id].count && !client.cooldowns[message.author.id].timeout) {
          delete client.cooldowns[message.author.id]
        }
      }, 180000)
      if (client.cooldowns[message.author.id].count > 3) {
        client.cooldowns[message.author.id].timedout = true
        setTimeout(() => delete client.cooldowns[message.author.id], 3000000)
        sendMessage(message, {
          title: "Please move channels",
          description: `Please either move to <#${config.channels.commands}>, or DM me to use more commands.\n\nThis helps to prevent filling channels with random bot messages. If you use DMs, it gives you an easy way to quickly see previous commands you have run.`,
          ephemeral: true
        })
        return
      }
    }
    return true
  },
  clearCooldown(message) {
    const id = message.command.cooldownType === "guild" ? message.guildId ?? message.channelId : message.author.id
    delete message.command.cooldowns?.[id]
  }
})