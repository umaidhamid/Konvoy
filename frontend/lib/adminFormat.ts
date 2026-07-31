export function timeAgo(dateString?: string) {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function memberLabel(m: { _id: string; fullname?: string; email?: string } | string | null | undefined) {
  if (!m) return "Deleted user";
  if (typeof m === "string") return m;
  return m.fullname || m.email || m._id;
}

export function isExpired(dateString: string | null) {
  return !!dateString && new Date(dateString).getTime() < Date.now();
}
