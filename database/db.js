globalThis.prepareDBAction = (action, run = "run", input = null, output = null) => {
  const prep = database.prepare(action)
  if (output) return (...args) => {
    if (input) args = input(...args)
    return output(prep[run](...args))
  }
  else return (...args) => {
    if (input) args = input(...args)
    return prep[run](...args)
  }
}

database.pragma("journal_mode = WAL")

export default {
  faq: (await import("./sql/faq.js")).default,
  users: (await import("./sql/users.js")).default,
  guilds: (await import("./sql/guilds.js")).default
}