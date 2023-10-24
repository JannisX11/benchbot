registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: [
      "Get the raw text from an FAQ entry.",
      "Run with no arguments to list all FAQs"
    ],
    arguments: "[category] [id]"
  },
  guildOnly: true,
  permissions: ["ManageMessages"],
  aliases: ["faqraw"],
  arguments: ["category", "id"],
  async execute(message, args) {
    args[0] = args[0].toLowerCase().trim()
    args[1] = args[1].toLowerCase().trim()
    const faq = db.faq.get(args[0], args[1])
    if (!faq) return sendError(message, {
      title: "FAQ not found",
      description: `There was no FAQ found with the category \`${args[0]}\` and the id \`${args[1]}\``
    })
    const files = [await makeFile({
      name: `${args[0]}-${args[1]}.txt`,
      buffer: Buffer.from(faq.text, "utf8")
    })]
    if (Object.keys(faq.data).length) files.push(await makeFile({
      name: `${args[0]}-${args[1]}-data.json`,
      buffer: Buffer.from(JSON.stringify(faq.data, null, 2), "utf8")
    }))
    return sendMessage(message, {
      embedless: true,
      files
    })
  }
})