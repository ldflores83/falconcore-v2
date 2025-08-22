"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Jest setup file
const globals_1 = require("@jest/globals");
// Mock Google Cloud Secret Manager
globals_1.jest.mock('@google-cloud/secret-manager', () => ({
    SecretManagerServiceClient: globals_1.jest.fn().mockImplementation(() => ({
        accessSecretVersion: globals_1.jest.fn().mockResolvedValue([{
                payload: {
                    data: Buffer.from('test-encryption-key-32-bytes-long-key-here')
                }
            }])
    }))
}));
// Mock Firebase Admin
globals_1.jest.mock('firebase-admin', () => ({
    initializeApp: globals_1.jest.fn(),
    firestore: globals_1.jest.fn(() => ({
        collection: globals_1.jest.fn(() => ({
            doc: globals_1.jest.fn(() => ({
                set: globals_1.jest.fn(),
                get: globals_1.jest.fn(),
                update: globals_1.jest.fn(),
                delete: globals_1.jest.fn()
            })),
            add: globals_1.jest.fn(),
            where: globals_1.jest.fn(() => ({
                get: globals_1.jest.fn(),
                orderBy: globals_1.jest.fn()
            })),
            orderBy: globals_1.jest.fn(() => ({
                get: globals_1.jest.fn()
            }))
        }))
    })),
    storage: globals_1.jest.fn(() => ({
        bucket: globals_1.jest.fn(() => ({
            file: globals_1.jest.fn(() => ({
                exists: globals_1.jest.fn(),
                download: globals_1.jest.fn(),
                delete: globals_1.jest.fn()
            })),
            getFiles: globals_1.jest.fn(),
            upload: globals_1.jest.fn()
        }))
    })),
    apps: [],
    Timestamp: {
        now: globals_1.jest.fn(() => ({ toMillis: () => Date.now() })),
        fromMillis: globals_1.jest.fn((ms) => ({ toMillis: () => ms }))
    }
}));
// Global test setup
beforeEach(() => {
    globals_1.jest.clearAllMocks();
});
