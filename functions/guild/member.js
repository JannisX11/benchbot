registerFunction(scriptName, {
  createMember(user) {
    const member = new Discord.GuildMember(client, {
      user
    })
    Object.defineProperty(member, "displayName", {
      value: user.displayName
    })
    Object.defineProperty(member, "displayColor", {
      value: 0
    })
    return member
  },
  optionToMember(interaction, option, args) {
    let member = interaction.options.getMember(option)
    if (!member) {
      member = interaction.options.getUser(option)
      if (member) member = createMember(member)
    }
    if (args?.userless && member && !member.guild) {
      sendError(interaction, {
        title: "Member unavailable",
        description: `${member} is not in this server`
      })
      return false
    }
    return member
  }
})