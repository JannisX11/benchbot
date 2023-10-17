database.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    popularPosts TEXT DEFAULT '[]'
  )
`).run()

export default {
  popularPosts: {
    add: prepareDBAction(`
      INSERT INTO users (id, popularPosts)
      VALUES (?, json_array(?))
      ON CONFLICT (id) DO UPDATE
      SET popularPosts = json_insert(popularPosts, '$[#]', ?)
      WHERE id = ? AND NOT EXISTS (SELECT 1 FROM json_each(popularPosts) WHERE value = ?)
    `, "run", (id, p) => [id, p, p, id, p]),
    worthy: prepareDBAction(`
      SELECT 1
      FROM users
      WHERE id = ? AND json_array_length(popularPosts) >= ?
    `, "get", id => [id, config.likes.posts], o => !!o),
    get: prepareDBAction(`
      SELECT popularPosts
      FROM users
      WHERE id = ?
    `, "get", null, o => JSON.parse(o?.popularPosts ?? "[]"))
  }
}