/**
 * Shared Configuration Loader
 *
 * This module loads and validates the global config.json file.
 * It can be used by both the app and worker to access centralized settings.
 */

import fs from 'fs'
import path from 'path'

export interface ProjectConfig {
  name: string
  description: string
}

export interface WorkerSyncConfig {
  schedule: string
  scheduleDescription?: string
  enabled: boolean
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
}

export interface WorkerApiConfig {
  requestTimeout?: number
  maxRetries?: number
  batchSize?: number
}

export interface WorkerLoggingConfig {
  level?: 'error' | 'warn' | 'info' | 'debug'
  includeTimestamps?: boolean
  logFile?: string
}

export interface WorkerConfig {
  sync: WorkerSyncConfig
  api?: WorkerApiConfig
  logging?: WorkerLoggingConfig
}

export interface DatabaseConfig {
  poolSize?: number
  connectionTimeout?: number
  queryTimeout?: number
  enableQueryLogging?: boolean
}

export interface AppFeaturesConfig {
  enableRegistration?: boolean
  enablePitching?: boolean
  requireEmailVerification?: boolean
  enableStripePayments?: boolean
}

export interface AppLimitsConfig {
  maxPitchesPerUser?: number
  maxPitchesPerDay?: number
  maxUploadSize?: number
  sessionTimeout?: number
}

export interface AppUIConfig {
  itemsPerPage?: number
  enableDarkMode?: boolean
  defaultTheme?: 'light' | 'dark' | 'system'
}

export interface AppConfig {
  features: AppFeaturesConfig
  limits: AppLimitsConfig
  ui?: AppUIConfig
}

export interface EmailRateLimitConfig {
  maxPerHour?: number
  maxPerDay?: number
}

export interface EmailTemplatesConfig {
  fromName?: string
  replyToEnabled?: boolean
}

export interface EmailConfig {
  enabled?: boolean
  rateLimit?: EmailRateLimitConfig
  templates?: EmailTemplatesConfig
}

export interface SecuritySessionConfig {
  maxAge?: number
  updateAge?: number
}

export interface SecurityRateLimitConfig {
  enabled?: boolean
  windowMs?: number
  maxRequests?: number
}

export interface SecurityCorsConfig {
  enabled?: boolean
  allowedOrigins?: string[]
}

export interface SecurityConfig {
  session?: SecuritySessionConfig
  rateLimit?: SecurityRateLimitConfig
  cors?: SecurityCorsConfig
}

export interface MonitoringHealthCheckConfig {
  enabled?: boolean
  interval?: number
}

export interface MonitoringMetricsConfig {
  enabled?: boolean
  endpoint?: string
}

export interface MonitoringConfig {
  healthCheck?: MonitoringHealthCheckConfig
  metrics?: MonitoringMetricsConfig
}

export interface MaintenanceConfig {
  enabled?: boolean
  message?: string
  allowedIPs?: string[]
}

export interface Config {
  version: string
  project: ProjectConfig
  worker: WorkerConfig
  database: DatabaseConfig
  app: AppConfig
  email?: EmailConfig
  security?: SecurityConfig
  monitoring?: MonitoringConfig
  maintenance?: MaintenanceConfig
}

let cachedConfig: Config | null = null

/**
 * Load configuration from config.json
 * @param configPath - Path to config.json (defaults to ../config.json from this file)
 * @returns Parsed configuration object
 */
export function loadConfig(configPath?: string): Config {
  if (cachedConfig) {
    return cachedConfig
  }

  const defaultPath = path.join(__dirname, 'config.json')
  const finalPath = configPath || process.env.CONFIG_PATH || defaultPath

  try {
    const configFile = fs.readFileSync(finalPath, 'utf-8')
    const config = JSON.parse(configFile) as Config

    // Basic validation
    if (!config.version) {
      throw new Error('Config missing required field: version')
    }
    if (!config.project) {
      throw new Error('Config missing required field: project')
    }
    if (!config.worker) {
      throw new Error('Config missing required field: worker')
    }
    if (!config.database) {
      throw new Error('Config missing required field: database')
    }
    if (!config.app) {
      throw new Error('Config missing required field: app')
    }

    cachedConfig = config
    return config
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`Config file not found at: ${finalPath}`)
      console.error('Please ensure config.json exists in the project root')
    }
    throw error
  }
}

/**
 * Get worker configuration
 */
export function getWorkerConfig(): WorkerConfig {
  const config = loadConfig()
  return config.worker
}

/**
 * Get app configuration
 */
export function getAppConfig(): AppConfig {
  const config = loadConfig()
  return config.app
}

/**
 * Get database configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  const config = loadConfig()
  return config.database
}

/**
 * Check if maintenance mode is enabled
 */
export function isMaintenanceMode(): boolean {
  const config = loadConfig()
  return config.maintenance?.enabled || false
}

/**
 * Get maintenance message
 */
export function getMaintenanceMessage(): string {
  const config = loadConfig()
  return config.maintenance?.message || 'System is under maintenance'
}

/**
 * Reload configuration (clears cache)
 */
export function reloadConfig(): Config {
  cachedConfig = null
  return loadConfig()
}

export default {
  loadConfig,
  getWorkerConfig,
  getAppConfig,
  getDatabaseConfig,
  isMaintenanceMode,
  getMaintenanceMessage,
  reloadConfig,
}
