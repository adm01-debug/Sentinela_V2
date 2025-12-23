export abstract class BaseController {
  protected success<T>(data: T, message = 'Success') { return { success: true, message, data }; }
  protected error(message: string, code = 400) { return { success: false, message, code }; }
  protected paginate<T>(data: T[], page: number, limit: number, total: number) { return { success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }; }
  protected validate(data: any, schema: any) { const result = schema.safeParse(data); if (!result.success) throw new Error(result.error.message); return result.data; }
}
