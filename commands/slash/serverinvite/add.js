registerSlashCommand(scriptName, slashPath, {
  command: "addserverinvite",
  options: [
    {
      name: "name",
      description: "The server name",
      required: true
    },
    {
      name: "invite",
      description: "The invite link",
      required: true
    }
  ]
})