registerSlashCommand(scriptName, slashPath, {
  command: "removefaq",
  options: [
    {
      name: "category",
      description: "The FAQ category",
      autocomplete: "faqCategories",
      maxLength: 32,
      required: true
    },
    {
      name: "id",
      description: "The FAQ ID",
      autocomplete: "faqIds",
      maxLength: 32,
      required: true
    }
  ]
})