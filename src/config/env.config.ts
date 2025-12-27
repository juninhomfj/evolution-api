import { isBooleanString } from 'class-validator';
import dotenv from 'dotenv';

dotenv.config();

export type HttpServer = {
  NAME: string;
  TYPE: 'http' | 'https';
  PORT: number;
  URL: string;
  DISABLE_DOCS: boolean;
  DISABLE_MANAGER: boolean;
};

export type HttpMethods = 'POST' | 'GET' | 'PUT' | 'DELETE';
export type Cors = {
  ORIGIN: string[];
  METHODS: HttpMethods[];
  CREDENTIALS: boolean;
};

export type LogBaileys = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
export type LogLevel =
  | 'ERROR'
  | 'WARN'
  | 'DEBUG'
  | 'INFO'
  | 'LOG'
  | 'VERBOSE'
  | 'DARK'
  | 'WEBHOOKS'
  | 'WEBSOCKET';

export type Log = {
  LEVEL: LogLevel[];
  COLOR: boolean;
  BAILEYS: LogBaileys;
};

export type ProviderSession = {
  ENABLED: boolean;
  HOST: string;
  PORT: string;
  PREFIX: string;
};

export type SaveData = {
  INSTANCE: boolean;
  HISTORIC: boolean;
  NEW_MESSAGE: boolean;
  MESSAGE_UPDATE: boolean;
  CONTACTS: boolean;
  CHATS: boolean;
  LABELS: boolean;
  IS_ON_WHATSAPP: boolean;
  IS_ON_WHATSAPP_DAYS: number;
};

export type DBConnection = {
  URI: string;
  CLIENT_NAME: string;
};

export type DeleteData = {
  LOGICAL_MESSAGE_DELETE: boolean;
};

export type Database = {
  CONNECTION: DBConnection;
  PROVIDER: string;
  SAVE_DATA: SaveData;
  DELETE_DATA: DeleteData;
};

export type EventsRabbitmq = {
  APPLICATION_STARTUP: boolean;
  INSTANCE_CREATE: boolean;
  INSTANCE_DELETE: boolean;
  QRCODE_UPDATED: boolean;
  MESSAGES_SET: boolean;
  MESSAGES_UPSERT: boolean;
  MESSAGES_EDITED: boolean;
  MESSAGES_UPDATE: boolean;
  MESSAGES_DELETE: boolean;
  SEND_MESSAGE: boolean;
  SEND_MESSAGE_UPDATE: boolean;
  CONTACTS_SET: boolean;
  CONTACTS_UPDATE: boolean;
  CONTACTS_UPSERT: boolean;
  PRESENCE_UPDATE: boolean;
  CHATS_SET: boolean;
  CHATS_UPDATE: boolean;
  CHATS_DELETE: boolean;
  CHATS_UPSERT: boolean;
  CONNECTION_UPDATE: boolean;
  LABELS_EDIT: boolean;
  LABELS_ASSOCIATION: boolean;
  GROUPS_UPSERT: boolean;
  GROUP_UPDATE: boolean;
  GROUP_PARTICIPANTS_UPDATE: boolean;
  CALL: boolean;
  TYPEBOT_START: boolean;
  TYPEBOT_CHANGE_STATUS: boolean;
};

export type Rabbitmq = {
  ENABLED: boolean;
  URI: string;
  FRAME_MAX: number;
  EXCHANGE_NAME: string;
  GLOBAL_ENABLED: boolean;
  EVENTS: EventsRabbitmq;
  PREFIX_KEY?: string;
};

export type Nats = Rabbitmq;

export type Env = {
  SERVER: HttpServer;
  CORS: Cors;
  DATABASE: Database;
};

export type Key = keyof Env;

export class ConfigService {
  private env: Env;

  constructor() {
    this.loadEnv();
  }

  public get<T = any>(key: Key): T {
    return this.env[key] as T;
  }

  private loadEnv() {
    this.env = this.envProcess();
    this.env.PRODUCTION = process.env.NODE_ENV === 'PROD';

    if (process.env.DOCKER_ENV === 'true') {
      this.env.SERVER.TYPE =
        (process.env.SERVER_TYPE as 'http' | 'https') || this.env.SERVER.TYPE;

      // 🔥 CORREÇÃO CRÍTICA: respeitar PORT do Render / PaaS
      if (process.env.PORT) {
        this.env.SERVER.PORT = Number(process.env.PORT);
      } else {
        this.env.SERVER.PORT =
          Number.parseInt(process.env.SERVER_PORT || '') || 8080;
      }
    }
  }

  private envProcess(): Env {
    return {
      SERVER: {
        NAME: process.env.SERVER_NAME || 'evolution',
        TYPE: (process.env.SERVER_TYPE as 'http' | 'https') || 'http',
        PORT:
          Number.parseInt(process.env.PORT || '') ||
          Number.parseInt(process.env.SERVER_PORT || '') ||
          8080,
        URL: process.env.SERVER_URL || '',
        DISABLE_DOCS: process.env.SERVER_DISABLE_DOCS === 'true',
        DISABLE_MANAGER: process.env.SERVER_DISABLE_MANAGER === 'true',
      },

      CORS: {
        ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['*'],
        METHODS:
          (process.env.CORS_METHODS?.split(',') as HttpMethods[]) || [
            'POST',
            'GET',
            'PUT',
            'DELETE',
          ],
        CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
      },

      DATABASE: {
        CONNECTION: {
          URI: process.env.DATABASE_CONNECTION_URI || '',
          CLIENT_NAME:
            process.env.DATABASE_CONNECTION_CLIENT_NAME || 'evolution',
        },
        PROVIDER: process.env.DATABASE_PROVIDER || 'postgresql',
        SAVE_DATA: {
          INSTANCE: process.env.DATABASE_SAVE_DATA_INSTANCE === 'true',
          HISTORIC: process.env.DATABASE_SAVE_DATA_HISTORIC === 'true',
          NEW_MESSAGE: process.env.DATABASE_SAVE_DATA_NEW_MESSAGE === 'true',
          MESSAGE_UPDATE:
            process.env.DATABASE_SAVE_MESSAGE_UPDATE === 'true',
          CONTACTS: process.env.DATABASE_SAVE_DATA_CONTACTS === 'true',
          CHATS: process.env.DATABASE_SAVE_DATA_CHATS === 'true',
          LABELS: process.env.DATABASE_SAVE_DATA_LABELS === 'true',
          IS_ON_WHATSAPP:
            process.env.DATABASE_SAVE_IS_ON_WHATSAPP === 'true',
          IS_ON_WHATSAPP_DAYS: Number.parseInt(
            process.env.DATABASE_SAVE_IS_ON_WHATSAPP_DAYS || '7',
          ),
        },
        DELETE_DATA: {
          LOGICAL_MESSAGE_DELETE:
            process.env.DATABASE_DELETE_MESSAGE === 'true',
        },
      },
    };
  }
}

export const configService = new ConfigService();
