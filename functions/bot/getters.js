async function get(thing, id) {
  if (!id || id.length > 19) return
  const got = await thing?.fetch(id).catch(() => {})
  if (got instanceof Discord.Collection) return
  return got
}

registerFunction(scriptName, {
  getChannel: (id, guild) => get(guild?.channels ?? client.channels, id),
  getGuild: id => get(client.guilds, id),
  getMember: (guild, id) => get(guild.members, id),
  getMessage: (channel, id) => get(channel.messages, id),
  getMessages(channel, opts) {
    if (!channel.guild || (hasPerm(channel.guild.members.me, "ViewChannel", channel) && hasPerm(channel.guild.members.me, "ReadMessageHistory", channel))) {
      return channel.messages.fetch(opts)
    }
    return new Discord.Collection
  },
  getUser: id => get(client.users, id),
  getRole: (guild, id) => get(guild.roles, id),
  getGuildEmoji: (guild, id) => get(guild.emojis, id),
  async getCommand(slashCommand, args) {
    let command
    if (args?.guild) {
      if (slashCommand.id) {
        if (args.id) return slashCommand.id
        command = args.guild.commands.cache.get(slashCommand.id)
        if (!command) {
          await args.guild.commands.fetch(slashCommand.id).catch(() => {})
          if (!command) return
        }
      } else {
        command = args.guild.commands.cache.find(e => e.name === slashCommand.tree[0])
        if (!command) {
          await args.guild.commands.fetch()
          command = args.guild.commands.cache.find(e => e.name === slashCommand.tree[0])
          if (!command) return
        }
        slashCommand.id = command.id
      }
      if (args.id) return slashCommand.id
    } else {
      if (slashCommand.id) {
        if (args.id) return slashCommand.id
        command = client.application.commands.cache.get(slashCommand.id)
        if (!command) {
          await client.application.commands.fetch(slashCommand.id)
          if (!command) return
        }
      } else {
        command = client.application.commands.cache.find(e => e.name === slashCommand.tree[0])
        if (!command) {
          await client.application.commands.fetch()
          command = client.application.commands.cache.find(e => e.name === slashCommand.tree[0])
          if (!command) return
        }
        slashCommand.id = command.id
      }
      if (args.id) return slashCommand.id
    }
    return command
  }
})