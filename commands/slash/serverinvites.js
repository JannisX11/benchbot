registerSlashCommand(scriptName, slashPath, {
  command: "serverinvite",
  options: [{
    name: "name",
    description: "The server name",
    autocomplete: "serverInvites"
  }]
})