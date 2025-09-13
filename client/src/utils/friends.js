const KEY = "friendLabels";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
function save(map) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function getFriendLabel(email) {
  const map = load();
  return map[email] || "";
}

export function setFriendLabel(email, label) {
  const map = load();
  if (!email) return;
  if (label && label.trim()) map[email] = label.trim();
  else delete map[email];
  save(map);
}

export function getAllFriendLabels() {
  return load();
}
