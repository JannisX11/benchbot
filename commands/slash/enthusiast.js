registerSlashCommand(scriptName, slashPath, {
  options: [{
    type: "user",
    name: "member",
    description: "The member to check"
  }]
})