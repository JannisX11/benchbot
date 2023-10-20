const replacements = {
  "3d": "3D",
  "3 d": "3D",
  "uv": "UV"
}

const pattern = new RegExp(`\\b(${Object.keys(replacements).join("|")})\\b`, "gi")

const replace = (a, b) => replacements[b.toLowerCase()]

registerFunction(scriptName, data => {
  if (data.data.embedless) return { content: `${data.text}${data.data.image ? `\n\n${data.data.image}` : ""}` }
  return {
    author: ["FAQ", client.icons.faq],
    title: `${data.category.toTitleCase(true, true).replace(pattern, replace)}: ${data.id.toTitleCase(true, true).replace(pattern, replace)}`,
    description: data.text,
    image: data.data.image,
    deletable: true
  }
})