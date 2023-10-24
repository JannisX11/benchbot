registerSlashCommand(scriptName, slashPath, {
  command: "removeserverinvite",
  options: [{
    name: "name",
    description: "The server name",
    autocomplete: "serverInvites"
  }]
})