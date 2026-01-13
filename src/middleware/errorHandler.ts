export const errorHandler = (error: Error, req: any, res: any, next: any) => {
  console.error("[Error]", error.message);
  res.status(500).json({ error: error.message });
};
