export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-()]{10,}$/,
  url: /^https?:\/\/[\w.-]+/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  ip: /^(?:\d{1,3}\.){3}\d{1,3}$/,
};
export const isEmail = (str) => patterns.email.test(str);
export const isURL = (str) => patterns.url.test(str);
export const isUUID = (str) => patterns.uuid.test(str);
