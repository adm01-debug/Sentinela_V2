import { NextResponse } from "next/server";
import { appConfig } from "@/config";

export async function GET() {
  return NextResponse.json({
    name: appConfig.name,
    version: appConfig.version,
    description: appConfig.description,
    environment: process.env.NODE_ENV,
  });
}
