export const normalizeEmail = (email: string): string => {
  const lower = email.trim().toLowerCase();

  const [local, domain] = lower.split("@");
  if (!domain) return lower;

  // Gmail-style aliasing
  const normalizedLocal = local.split("+")[0];

  return `${normalizedLocal}@${domain}`;
};
