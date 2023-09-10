registerSlashCommand(scriptName, slashPath, {
  command: "editrule",
  options: [{
    name: "rule",
    description: "The rule number",
    autocomplete: "rules"
  }]
})