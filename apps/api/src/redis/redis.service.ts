import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: Number(this.configService.get('REDIS_PORT')),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    this.redis.on('error', (err) => {
      this.logger.warn(`Redis connection error (non-fatal): ${err.message}`);
    });
  }

  getClient(): Redis {
    return this.redis;
  }

  async onModuleDestroy() {
    if (this.redis.status === 'ready' || this.redis.status === 'connecting') {
      await this.redis.quit().catch(() => {
        // ignore errors on shutdown if already disconnected
      });
    }
  }
}
