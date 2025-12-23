export interface ScreenshotDTO { id: string; employee_id: string; image_url: string; thumbnail_url?: string; captured_at: string; activity_id?: string; }
export interface CreateScreenshotDTO { employee_id: string; image_url: string; thumbnail_url?: string; activity_id?: string; }
