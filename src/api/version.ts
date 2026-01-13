export const getVersion = () => ({ version: "19.0.0", build: process.env.BUILD_ID || "dev", env: process.env.NODE_ENV });
