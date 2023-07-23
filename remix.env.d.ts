/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    SESSION_SECRET: string;
    STRIPE_SECRET_KEY: string;
    WEBSITE_URL: string;
    MAPS_API_KEY: string;
  }
}
