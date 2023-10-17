registerSlashCommand(scriptName, slashPath, {
  command: "rule",
  options: [{
    name: "rule",
    description: "The rule number",
    autocomplete: "rules"
  }]
})