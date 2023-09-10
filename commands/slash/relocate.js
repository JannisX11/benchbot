registerSlashCommand(scriptName, slashPath, {
  guildOnly: true,
  options: [{
    name: "member-or-message-url",
    description: "The member or message URL to relocate"
  }]
})