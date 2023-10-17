registerFunction(scriptName, data => {
  if (data.data.embedless) return { content: `${data.text}${data.data.image ? `\n\n${data.data.image}` : ""}` }
  return {
    author: ["FAQ", client.icons.faq],
    title: `${data.category.toTitleCase(true, true)}: ${data.id.toTitleCase(true, true)}`,
    description: data.text,
    image: data.data.image,
    deletable: true
  }
})