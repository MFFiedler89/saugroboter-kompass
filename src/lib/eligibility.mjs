// Negative requirements need affirmative evidence, never missing keywords.
// Keep these rules independent of navigation: LiDAR can coexist with a camera.
export function eligibility(subSlug, title = '', features = []) {
  const parts = [title, ...features].map((s) => String(s));
  const text = parts.join(' | ');
  if (subSlug === 'saugroboter-ohne-kamera') {
    const proof = /\bohne\s+(?:jegliche\s+)?kamera(?:s)?\b|\bkeine\s+kamera(?:s)?\b|\bkamerafrei\b/i;
    // RGB-/navigation-only exclusions do not prove absence of every image sensor.
    const affirmative = parts.some((p) => proof.test(p)) && !/(?:nicht|nie)\s+ohne\s+(?:jegliche\s+)?kamera/i.test(text);
    const stripped = text.replace(new RegExp(proof.source, 'gi'), '');
    const conflict = /\bkamera|\brgb[- ]?kamera|\b(vslam|aivi|maxv)\b|haustierkamera|videoanruf|fernüberwachung/i.test(stripped);
    return affirmative && !conflict;
  }
  if (subSlug === 'saugroboter-ohne-app') {
    // Exact model confirmed by eufy, checked 2026-10-10:
    // https://www.eufy.com/blogs/robovac/robot-vacuum-without-wifi
    // Do not match 11C or hybrids, and let conflicting live data veto the rule.
    const verified11S = /\beufy\b/i.test(title) && /\b(?:robovac\s+)?11\s*s(?:\s+max)?\b/i.test(title)
      && !/\b(?:hybrid|11c|g30|pro|plus|maxv)\b/i.test(title);
    const proof = /ohne\s+app\s*(?:und|&)\s*(?:ohne\s+)?(?:wlan|wi-?fi)|ohne\s+(?:wlan|wi-?fi)\s*(?:und|&)\s*(?:ohne\s+)?app|(?:keine|kein)\s+(?:wlan|wi-?fi)[^|.]{0,35}(?:keine|kein)\s+app/i;
    const affirmative = parts.some((p) => proof.test(p)) && !/(?:nicht|nie)\s+ohne\s+(?:app|wlan|wi-?fi)/i.test(text);
    const stripped = text.replace(new RegExp(proof.source, 'gi'), '');
    const conflict = /\b(?:app[- ]steuerung|app[- ]gesteuert|wifi|wi-fi|wlan|alexa|google home|sprachsteuerung)\b/i.test(stripped);
    return (verified11S || affirmative) && !conflict;
  }
  return true;
}
