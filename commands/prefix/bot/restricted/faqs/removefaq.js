registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: "Remove an FAQ entry.",
    arguments: "[category] [id]"
  },
  guildOnly: true,
  permissions: ["ManageMessages"],
  aliases: ["faqremove", "deletefaq", "faqdelete"],
  arguments: ["category", "id"],
  async execute(message, args) {
    args[0] = args[0].toLowerCase().trim()
    args[1] = args[1].toLowerCase().trim()
    let check
    const existing = db.faq.get(args[0], args[1])
    if (!existing) return sendError(message, {
      title: "FAQ not found",
      description: `There was no FAQ found with the category \`${args[0]}\` and the id \`${args[1]}\``
    })
    check = await confirm(message, {
      description: `Are you sure you want to remove the FAQ \`${args[0].toTitleCase(true, true)}: ${args[1].toTitleCase(true, true)}\`?\n\nThis action cannot be undone`,
      danger: true
    })
    if (!check[0]) return editMessage(check[1], {
      description: "The FAQ removal has been aborted"
    })
    db.faq.remove(args[0], args[1])
    editMessage(check[1], {
      title: "FAQ removed",
      description: `The \`${args[0].toTitleCase(true, true)}: ${args[1].toTitleCase(true, true)}\` FAQ has been removed`
    })
  }
})