registerAutocomplete(scriptName, (interaction, text, options, type) => {
  const category = options.getString(type ? `${type}-category` : "category")
  if (!category) return interaction.respond([{ name: "Please select a category first", value: "select-category-first" }])
  interaction.respond(filteredSort(db.faq.ids(category), text, 25).map(e => ({ name: e, value: e })))
})