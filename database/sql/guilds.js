database.prepare(`
  CREATE TABLE IF NOT EXISTS guilds (
    id TEXT PRIMARY KEY,
    rules TEXT DEFAULT '[]'
  )
`).run()

export default {
  rules: {
    add: prepareDBAction(`
      INSERT INTO guilds (id, rules)
      VALUES (?, json_array(json_array(?, ?)))
      ON CONFLICT (id) DO UPDATE
      SET rules = json_insert(rules, '$[#]', json_array(?, ?))
      WHERE id = ?
    `, "run", (id, rule) => [id, rule[0], rule[1] ?? "", rule[0], rule[1] ?? "", id]),
    all: prepareDBAction(`
      SELECT rules
      FROM guilds
      WHERE id = ?
    `, "get", null, o => JSON.parse(o?.rules ?? "[]")),
    count: prepareDBAction(`
      SELECT json_array_length(rules) AS count
      FROM guilds
      WHERE id = ?
    `, "get", null, o => o?.count ?? 0),
    get: prepareDBAction(`
      SELECT json_extract(rules, '$[' || ? || ']') as rule
      FROM guilds
      WHERE id = ?
    `, "get", (id, i) => [i.toString(), id], o => o ? JSON.parse(o.rule) : null),
    remove: prepareDBAction(`
      UPDATE guilds
      SET rules = json_remove(rules, '$[' || ? || ']')
      WHERE id = ?
    `, "run", (id, i) => [i.toString(), id]),
    edit: prepareDBAction(`
      UPDATE guilds
      SET rules = json_replace(rules, '$[' || ? || ']', json_array(?, ?))
      WHERE id = ?
    `, "run", (id, i, rule) => [i.toString(), rule[0], rule[1] ?? "", id])
  }
}