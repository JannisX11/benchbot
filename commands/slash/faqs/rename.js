registerSlashCommand(scriptName, slashPath, {
  command: "renamefaq",
  options: [
    {
      name: "old-category",
      description: "The old FAQ category",
      autocomplete: "faqCategories",
      maxLength: 32,
      required: true
    },
    {
      name: "old-id",
      description: "The old FAQ ID",
      autocomplete: "faqIds:old",
      maxLength: 32,
      required: true
    },
    {
      name: "new-category",
      description: "The new FAQ category",
      autocomplete: "faqCategories",
      maxLength: 32,
      required: true
    },
    {
      name: "new-id",
      description: "The new FAQ ID",
      maxLength: 32,
      required: true
    }
  ]
})