const pattern = /^https:\/\/discord\.com\/invite\/.*/

registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: "Add a new server invite.",
    arguments: "[name] [invite]"
  },
  guildOnly: true,
  aliases: ["addserver", "addinvite"],
  permissions: ["ManageGuild"],
  arguments: ["name", "invite"],
  async execute(message, args) {
    const id = args.slice(0, -1).join("-").toLowerCase().replace(/\s/g, "").trim()
    let invite = args.slice(-1)[0]
    if (!invite.match(/^https?:\/\/.*/)) invite = "https://" + invite
    const r = await argTypes.realURL(invite, { message })
    if (r instanceof Discord.Message) return
    else if (!r) return sendArgError(message, invite, "invite", "URL")
    const count = db.guilds.serverInvites.count(config.guild)
    if (count >= 15) return sendError(message, {
      title: "Maximum number of server invites",
      description: "The maximum number of server invites that you can have is `15`"
    })
    if (args[0].length > 24) return sendError(message, {
      title: "Server invite name too long",
      description: "The maximum server invite name length is `24`"
    })
    const existing = db.guilds.serverInvites.getId(config.guild, id)
    if (existing) return sendError(message, {
      title: "Invite already exists",
      description: `An invite with the name \`${id.toTitleCase(true)}\` already exists with the server invite \`${existing[1]}\``
    })
    const existing2 = db.guilds.serverInvites.getInvite(config.guild, invite)
    if (existing2) return sendError(message, {
      title: "Invite already exists",
      description: `The invite \`${invite}\` already exists with the id \`${existing2[0]}\``
    })
    if (!pattern.test(r[1].url)) return sendError(message, {
      title: "Invalid Discord invite link",
      description: `The link \`${invite}\` is not a valid Discord invite link`
    })
    db.guilds.serverInvites.add(config.guild, [id, invite])
    sendMessage(message, {
      title: "Server invite added",
      description: `The server invite \`${id.toTitleCase(true)}\` ${invite} has been added to the server`
    })
  }
})