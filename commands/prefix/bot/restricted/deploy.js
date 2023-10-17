function setupOption(option, data, args) {
  option.setName(args?.name ?? data.name ?? data.type).setDescription(args?.description ?? data.description).setRequired(data.required ? data.required : false).setAutocomplete?.(!!data.autocomplete)
  if (data.choices) option.setChoices(...data.choices.map(e => ({ name: e, value: e.toLowerCase() })))
  if (defined(data.min)) option.setMinValue(data.min)
  if (defined(data.max)) option.setMaxValue(data.max)
  if (defined(data.minLength)) option.setMinLength(data.minLength)
  if (defined(data.maxLength)) option.setMaxLength(data.maxLength)
  return option
}

function makeCommand(command, options) {
  if (!options.description) options.description = Array.isArray(options.prefixCommand.help.description) ? options.prefixCommand.help.description[0] : options.prefixCommand.help.description
  if (options.description.length > 100) throw Error(`Slash command description too long for \`${options.name}\``)
  command.setName(options.name).setDescription(options.description)
  if (options.permissions.length && command.setDefaultMemberPermissions) {
    command.setDefaultMemberPermissions(options.permissions.map?.(e => getType.permission(e))?.reduce?.((a, e) => a | e, 0n))
  }
  if (options.guildOnly) command.setDMPermission?.(false)
  if (options.options) for (const option of options.options) {
    if (option.type === "user" || option.type === "member") command.addUserOption(e => setupOption(e, option))
    else if (option.type === "string" || !option.type) command.addStringOption(e => setupOption(e, option))
    else if (option.type === "number") command.addNumberOption(e => setupOption(e, option))
    else if (option.type === "integer") command.addIntegerOption(e => setupOption(e, option))
    else if (option.type === "boolean") command.addBooleanOption(e => setupOption(e, option))
    else if (option.type === "channel") command.addChannelOption(e => setupOption(e, option))
    else if (option.type === "role") command.addRoleOption(e => setupOption(e, option))
    else if (option.type === "attachment") command.addAttachmentOption(e => setupOption(e, option))
    else if (option.type === "image") {
      command.addAttachmentOption(e => setupOption(e, option, {
        name: `${option.name ?? option.type}-attachment`,
        description: option.description ?? "An image"
      }))
      if (!option.attachmentOnly) command.addStringOption(e => setupOption(e, option, {
        name: `${option.name ?? option.type}-string`,
        description: option.description ?? "An image"
      }))
    }
  }
  return command
}

async function loadCommands(parent, category, command) {
  const collection = parent.get(category[category.length - 1])
  const subCommands = []
  for (const file of fs.readdirSync(`./commands/slash/${category.join("/")}`)) {
    if (file.endsWith(".js")) {
      const subCommand = collection.get(file.slice(0, -3))
      subCommands.push(subCommand)
    } else if (!file.endsWith(".json")) {
      const options = JSON.parse(fs.readFileSync(`./commands/slash/${category.join("/")}/${file}/command.json`, "utf8"))
      const group = new Discord.SlashCommandSubcommandGroupBuilder().setName(file).setDescription(options.description)
      await loadCommands(collection, [...category, file], group)
      command.addSubcommandGroup(g => group.setName(file).setDescription(options.description))
    }
  }
  for (const options of subCommands) command.addSubcommand(subCommand => makeCommand(subCommand, options))
}

registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: "Deploy the application commands."
  },
  permissions: ["BotOwner"],
  async execute(message, args) {
    try {
      const commands = []

      for (const file of fs.readdirSync("./commands/slash")) {
        if (file.endsWith(".js")) {
          const command = client.slashCommands.get(file.slice(0, -3))
          commands.push(makeCommand(new Discord.SlashCommandBuilder(), command))
        } else {
          const options = JSON.parse(fs.readFileSync(`./commands/slash/${file}/command.json`, "utf8"))
          const command = new Discord.SlashCommandBuilder().setName(file).setDescription(options.description)
          if (options.permissions) command.setDefaultMemberPermissions(options.permissions.map?.(e => getType.permission(e))?.reduce?.((a, e) => a | e, 0n))
          if (options.guildOnly) command.setDMPermission(false)
          await loadCommands(client.slashCommands, [file], command)
          commands.push(command)
        }
      }

      for (const file of fs.readdirSync("./commands/context")) {
        const options = client.contextCommands.find(e => e.command === file.slice(0, -3))
        const command = new Discord.ContextMenuCommandBuilder().setName(options.name).setType(Discord.ApplicationCommandType[options.contextType ?? "Message"])
        if (options.permissions.length) command.setDefaultMemberPermissions(options.permissions.map?.(e => getType.permission(e))?.reduce?.((a, e) => a | e, 0n))
        if (options.guildOnly) command.setDMPermission(false)
        commands.push(command)
      }

      const rest = new Discord.REST({ version: "10" }).setToken(tokens.discord)

      if (testMode) await rest.put(Discord.Routes.applicationGuildCommands(client.user.id, message.guildId), { body: commands })
      else await rest.put(Discord.Routes.applicationCommands(client.user.id), { body: commands })

      sendMessage(message, {
        description: "Successfully registered application commands."
      })

    } catch (err) {
      console.error(err)
      sendError(message, {
        title: "There was an error while deploying application commands",
        description: err.message 
      })
    }
  }
})