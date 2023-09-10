registerFunction(scriptName, async (interaction, modal, fields, args) => {
  const errorFields = []
  const modal2 = {
    title: modal.title,
    rows: []
  }
  let required
  for (const row of modal.rows) {
    if (row.text) {
      let error
      const text = interaction.fields.getTextInputValue(row.text.id).trim()
      if (text) {
        fields[row.text.id] = interaction.fields.getTextInputValue(row.text.id) || undefined
        if (fields[row.text.id]) {
          if (row.text.type) {
            if (row.text.type === "url") {
              const url = await argTypes.url(fields[row.text.id], { errorless: true })
              if (!url) {
                error = true
                errorFields.push([`URL not found for \`${row.text.label}\``, `The URL \`${fields[row.text.id]}\` could not be found`])
              }
            } else if (row.text.type === "boolean") {
              const boolean = await argTypes.boolean(fields[row.text.id])
              if (boolean === undefined) {
                error = true
                errorFields.push([`Invalid boolean for \`${row.text.label}\``, `\`${fields[row.text.id]}\` is not a valid boolean\n\nPlease provide \`yes\` or \`no\``])
              } else fields[row.text.id] = boolean
            }
          }
          if (row.text.invalidChars) {
            const match = fields[row.text.id].match(row.text.invalidChars)
            if (match) {
              error = true
              errorFields.push([`Unsupported character in \`${row.text.label}\``, `You cannot use the \`${match[0] === "\n" ? "newline" : match[0] === " " ? "space" : match[0]}​\` character`])
            }
          }
          if (row.text.func) fields[row.text.id] = await row.text.func(fields[row.text.id], fields)
        }
      } else if (row.text.required) {
        error = true
        errorFields.push(["Missing required field", `\`${row.text.label}\` is a required field`])
      }
      if (!error && row.text.validation) {
        const validation = await row.text.validation(fields[row.text.id], fields)
        if (validation) {
          error = true
          if (validation.required) required = true
          if (validation.fields) modal2.rows.push(...validation.fields)
          errorFields.push([`Validation failed for \`${row.text.label}\``, validation.message ?? validation])
        }
      }
      if (error) {
        modal2.rows.push(row)
        required = required || row.text.required
        fields[row.text.id] = undefined
      }
    }
  }
  return [modal2, errorFields, required]
})