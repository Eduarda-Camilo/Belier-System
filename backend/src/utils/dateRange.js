/**
 * Utilitário para interpretar range de datas (today, yesterday, 7d, 15d).
 * Retorna { start, end } ou null.
 */
function parseRange(range) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  switch (range) {
    case 'today':
      return { start: new Date(start), end: new Date(now) };
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    case '7d':
      start.setDate(start.getDate() - 7);
      return { start, end: new Date(now) };
    case '15d':
      start.setDate(start.getDate() - 15);
      return { start, end: new Date(now) };
    default:
      return null;
  }
}

module.exports = { parseRange };
