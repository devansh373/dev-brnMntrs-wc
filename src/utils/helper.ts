export const stripHtml = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText || div.textContent || "";
};
export const formatTime = (timeStr: string) => {
  const [hour, minute] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
};
