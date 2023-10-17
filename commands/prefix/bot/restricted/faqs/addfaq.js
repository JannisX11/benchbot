registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: "Add or update an FAQ entry."
  },
  permissions: ["ManageMessages"],
  aliases: ["faqadd", "setfaq", "faqset"],
  async execute(message) {
    let modalMessage
    if (!message.command.application) {
      modalMessage = await sendMessage(message, {
        description: "Press the button to start creating an FAQ",
        components: [makeRow({
          buttons: [{
            label: "Create an FAQ",
            emoji: client.emotes.pencilWhite,
            customId: "modal"
          }]
        })]
      })
    }
    let faq
    if (!await modalHandler(message, modalMessage, {
      title: "FAQ Builder",
      rows: [
        {
          text: {
            id: "category",
            label: "FAQ Category",
            maxLength: 32,
            placeholder: "The category for the FAQ",
            required: true,
            invalidChars: /\\|`|"|“|”/,
            func: e => e.toLowerCase().replace(/_|\s/g, "-")
          }
        },
        {
          text: {
            id: "id",
            label: "FAQ ID",
            maxLength: 32,
            placeholder: "The ID for the FAQ",
            required: true,
            func: e => e.toLowerCase().replace(/_|\s/g, "-")
          }
        },
        {
          text: {
            id: "text",
            label: "FAQ Text",
            maxLength: 1024,
            placeholder: "The text for the FAQ",
            long: true,
            required: true
          }
        }
      ]
    }, async (fields, interaction, message) => {
      faq = {
        category: fields.category,
        id: fields.id,
        text: await insertDiscordMentions(message.guild, fields.text),
        data: {}
      }
      modalMessage = message
      return true
    }, {
      authorOnly: true,
      leave: true
    })) return
    let check
    const existing = db.faq.get(faq.category, faq.id)
    if (existing) {
      check = await confirm(message, {
        description: `The FAQ \`${faq.id}\` already exists in the \`${faq.category}\` category\n\nAre you sure you want to replace it?`,
        danger: true,
        processing: modalMessage
      })
      if (!check[0]) return editMessage(check[1], {
        description: "The FAQ replacement has been aborted"
      })
      modalMessage = check[1]
      faq.data = existing.data
    }
    modalMessage = await sendMessage(message, {
      description: "Press a button to continue creating the FAQ",
      components: [makeRow({
        buttons: [
          {
            label: "Extra FAQ options",
            emoji: client.emotes.pencilWhite,
            customId: "modal"
          },
          {
            label: "Skip",
            customId: "skip",
            emoji: client.emotes.arrowRightWhite
          }
        ]
      })],
      processing: modalMessage,
      fetch: true
    })
    if (!await modalHandler(message, modalMessage, {
      title: "FAQ Builder",
      rows: [
        {
          text: {
            id: "embed",
            label: "Should the FAQ be in an embed?",
            placeholder: "Default: Yes",
            type: "boolean"
          }
        },
        {
          text: {
            id: "image",
            label: "Image URL",
            placeholder: "An image to show alongside the FAQ",
            type: "url"
          }
        },
        {
          text: {
            id: "aliases",
            label: "FAQ ID Aliases",
            placeholder: "Alternative FAQ IDs (comma separated)",
            invalidChars: /\\|`|"|“|”/,
            func(item, fields) {
              item = new Set(item.toLowerCase().split(",").map(e => e.trim().replace(/_|\s/g, "-")).filter(e => e && e !== faq.id))
              return Array.from(item)
            },
            validation(item) {
              if (item) {
                if (item.size > 10) return "Too many aliases. The maximum number of aliases is `10`"
                for (const alias of item) {
                  if (alias.length > 32) return "An alias was too long. The maximum alias length is `32` characters"
                  if (db.faq.alias(faq.category, faq.id, alias)) return `The alias \`${alias}\` is already in use in another FAQ, please pick a different alias`
                }
              }
            }
          }
        }
      ]
    }, fields => {
      if (defined(fields.embed)) faq.data.embedless = fields.embed === false ? true : undefined
      if (fields.image) faq.data.image = fields.image
      if (fields.aliases?.length) faq.data.aliases = fields.aliases
      return true
    }, {
      authorOnly: true,
      leave: true
    })) return
    db.faq.set(faq.category, faq.id, faq.text, faq.data)
    if (faq.data.embedless) {
      sendMessage(message, {
        title: `FAQ ${existing ? "updated" : "added"}`,
        description: "Here is a preview of the FAQ:",
        processing: modalMessage,
        components: []
      })
      return sendMessage(message.channel, {
        content: makeFAQ(faq).content
      })
    }
    sendMessage(message, {
      embeds: [
        {
          title: `FAQ ${existing ? "updated" : "added"}`,
          description: "Here is a preview of the FAQ:"
        },
        makeFAQ(faq)
      ],
      processing: modalMessage,
      components: []
    })
  }
})