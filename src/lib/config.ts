export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hepta.webuntis.com/WebUntis/monitor/substitution/data',
    schoolName: process.env.NEXT_PUBLIC_SCHOOL_NAME || 'dessauer-schule-limburg',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
    retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '3'),
  },
  cache: {
    duration: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '300000'), // 5 minutes
  },
  app: {
    enableWelcomeOverlay: process.env.NEXT_PUBLIC_ENABLE_WELCOME !== 'false',
    enableSampleData: process.env.NEXT_PUBLIC_USE_SAMPLE_DATA === 'true',
  },
} as const;

export type Config = typeof config; 