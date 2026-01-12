import { NextResponse } from "next/server";
import { appConfig } from "@/config";

export async function GET() {
  // Return public config only
  return NextResponse.json({
    features: appConfig.features,
    limits: {
      maxUploadSize: appConfig.limits.maxUploadSize,
    },
    defaults: {
      pageSize: appConfig.defaults.pageSize,
    },
  });
}
