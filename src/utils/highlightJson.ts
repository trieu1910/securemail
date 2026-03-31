/**
 * Adds syntax highlighting spans to a JSON string for display in CipherPanel.
 * Returns an HTML string safe for dangerouslySetInnerHTML.
 */
export function highlightJson(json: string): string {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .replace(/: "(.*?)"/g, ': <span class="text-green-400">"$1"</span>')
    .replace(/"(\w+)":/g, '<span class="text-blue-400">"$1"</span>:')
    .replace(/: (\d+)/g, ': <span class="text-amber-400">$1</span>')
    .replace(/: (true|false|null)/g, ': <span class="text-amber-400">$1</span>')
    .replace(/([{}[\]])/g, '<span class="text-slate-400">$1</span>')
}
