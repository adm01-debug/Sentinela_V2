export class RelativeTime {
  format(date: Date, locale = 'pt-BR'): string { const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }); const diff = date.getTime() - Date.now(); const diffDays = Math.round(diff / 86400000); const diffHours = Math.round(diff / 3600000); const diffMinutes = Math.round(diff / 60000); if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day'); if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour'); return rtf.format(diffMinutes, 'minute'); }
  timeAgo(date: Date): string { const seconds = Math.floor((Date.now() - date.getTime()) / 1000); if (seconds < 60) return 'agora'; if (seconds < 3600) return Math.floor(seconds / 60) + ' min atrás'; if (seconds < 86400) return Math.floor(seconds / 3600) + 'h atrás'; return Math.floor(seconds / 86400) + 'd atrás'; }
}
export const relativeTime = new RelativeTime();
