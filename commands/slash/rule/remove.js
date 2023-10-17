registerSlashCommand(scriptName, slashPath, {
  command: "removerule",
  options: [{
    name: "rule",
    description: "The rule number",
    autocomplete: "rules"
  }]
})