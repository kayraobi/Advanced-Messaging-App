"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    jwt: {
        secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
    },
    cors: {
        origins: (process.env.CORS_ORIGINS ?? 'http://localhost:19006').split(','),
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
    },
};
//# sourceMappingURL=config.js.map