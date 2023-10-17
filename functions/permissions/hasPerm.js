registerFunction(scriptName, {
  hasPerm(member, perm, channel) {
    if (perm === null) return true
    if (!member.guild) return true
    let has
    if (channel) has = channel.permissionsFor(member)?.has?.(Discord.PermissionsBitField.Flags[perm] ?? perm)
    else has = member.permissions.has(Discord.PermissionsBitField.Flags[perm] ?? perm)
    return has === undefined ? true : has
  },
  permChecks: {
    react: (member, channel) => hasPerm(member, "AddReactions", channel),
    sendMessages(message, member, channel, args) {
      if (!hasPerm(member, channel.isThread() ? "SendMessagesInThreads" : "SendMessages", channel) || !hasPerm(member, "EmbedLinks", channel) || !hasPerm(member, "ViewChannel", channel)) {
        if (args?.react !== false) react(message, client.emotes.missingPermissions)
        if (args?.error && isMod(message.member)) sendError(message.author, args.error)
      } else return true
    }
  }
})