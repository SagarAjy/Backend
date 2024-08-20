"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const logger = (0, winston_1.createLogger)({
    transports: [
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(({ timestamp, level, message }) => {
                return `[${timestamp}] ${level}: ${message}`;
            })),
        }),
        new winston_1.transports.File({
            dirname: 'logs',
            filename: 'orion_v1_error_log.log',
            format: winston_1.format.combine(winston_1.format.json()),
        }),
    ],
    format: winston_1.format.combine(winston_1.format.metadata(), winston_1.format.timestamp()),
});
exports.logger = logger;
//# sourceMappingURL=logger.js.map