registerLoadIn(scriptName, {
  load() {
    client.emotes = {
      arrowRightWhite: "1149743607801200801",
      binWhite: "1149743611508969482",
      crossWhite: "1149743626159665222",
      flagWhite: "1149743613476089906",
      pencilWhite: "1149743618421174312",
      questionWhite: "1149743617141919804",
      success: "1149743621755641909",
      tickWhite: "1149743623932489828"
    }
  },
  unload: () => delete client.emotes
})