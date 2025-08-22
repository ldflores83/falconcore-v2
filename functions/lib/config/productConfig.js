"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PRODUCT_CONFIG = exports.PRODUCT_CONFIG = void 0;
exports.PRODUCT_CONFIG = {
    'uaylabs': {
        frontendUrl: 'https://uaylabs.web.app',
        collections: {
            submissions: 'uaylabs_submissions',
            waitlist: 'uaylabs_waitlist',
            analytics_visits: 'analytics_visits', // Temporal: usar colección global
            analytics_stats: 'analytics_stats', // Temporal: usar colección global
            oauth_credentials: 'oauth_credentials',
            admin_sessions: 'admin_sessions'
        },
        storageBucket: 'falconcore-uaylabs-uploads',
        features: {
            fileUpload: true,
            documentGeneration: true,
            analytics: true,
            waitlist: true,
            oauth: true,
            adminPanel: true,
            formSubmission: true
        },
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFilesPerUpload: 10,
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100
        }
    },
    'onboardingaudit': {
        frontendUrl: 'https://uaylabs.web.app',
        collections: {
            submissions: 'onboardingaudit_submissions',
            waitlist: 'waitlist_onboarding_audit', // Temporal: usar colección antigua
            analytics_visits: 'analytics_visits', // Temporal: usar colección global
            analytics_stats: 'analytics_stats', // Temporal: usar colección global
            oauth_credentials: 'oauth_credentials',
            admin_sessions: 'admin_sessions'
        },
        storageBucket: 'falconcore-onboardingaudit-uploads',
        features: {
            fileUpload: true,
            documentGeneration: true,
            analytics: true,
            waitlist: true,
            oauth: true,
            adminPanel: true,
            formSubmission: true
        },
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFilesPerUpload: 10,
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100
        }
    },
    'jobpulse': {
        frontendUrl: 'https://jobpulse.web.app',
        collections: {
            submissions: 'jobpulse_submissions',
            waitlist: 'waitlist_jobpulse', // Temporal: usar colección antigua
            analytics_visits: 'analytics_visits', // Temporal: usar colección global
            analytics_stats: 'analytics_stats', // Temporal: usar colección global
            oauth_credentials: 'oauth_credentials',
            admin_sessions: 'admin_sessions'
        },
        storageBucket: 'falconcore-jobpulse-uploads',
        features: {
            fileUpload: true,
            documentGeneration: true,
            analytics: true,
            waitlist: true,
            oauth: true,
            adminPanel: true,
            formSubmission: true
        },
        maxFileSize: 10 * 1024 * 1024,
        maxFilesPerUpload: 10,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            maxRequests: 100
        }
    },
    'pulziohq': {
        frontendUrl: 'https://pulziohq.web.app',
        collections: {
            submissions: 'pulziohq_submissions',
            waitlist: 'waitlist_pulziohq', // Temporal: usar colección antigua
            analytics_visits: 'analytics_visits', // Temporal: usar colección global
            analytics_stats: 'analytics_stats', // Temporal: usar colección global
            oauth_credentials: 'oauth_credentials',
            admin_sessions: 'admin_sessions'
        },
        storageBucket: 'falconcore-pulziohq-uploads',
        features: {
            fileUpload: true,
            documentGeneration: true,
            analytics: true,
            waitlist: true,
            oauth: true,
            adminPanel: true,
            formSubmission: true
        },
        maxFileSize: 10 * 1024 * 1024,
        maxFilesPerUpload: 10,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            maxRequests: 100
        }
    },
    'ignium': {
        frontendUrl: 'https://ignium.web.app',
        collections: {
            submissions: 'ignium_submissions',
            waitlist: 'waitlist_ignium', // Temporal: usar colección antigua
            analytics_visits: 'analytics_visits', // Temporal: usar colección global
            analytics_stats: 'analytics_stats', // Temporal: usar colección global
            oauth_credentials: 'oauth_credentials',
            admin_sessions: 'admin_sessions'
        },
        storageBucket: 'falconcore-ignium-uploads',
        features: {
            fileUpload: true,
            documentGeneration: true,
            analytics: true,
            waitlist: true,
            oauth: true,
            adminPanel: true,
            formSubmission: true
        },
        maxFileSize: 10 * 1024 * 1024,
        maxFilesPerUpload: 10,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            maxRequests: 100
        }
    },
    'ahau': {
        frontendUrl: 'https://uaylabs.web.app/ahau',
        collections: {
            submissions: 'ahau_submissions',
            waitlist: 'waitlist_ahau', // Temporal: usar colección antigua
            analytics_visits: 'analytics_visits', // Temporal: usar colección global
            analytics_stats: 'analytics_stats', // Temporal: usar colección global
            oauth_credentials: 'oauth_credentials',
            admin_sessions: 'admin_sessions'
        },
        storageBucket: 'falconcore-ahau-uploads',
        features: {
            fileUpload: false,
            documentGeneration: false,
            analytics: true,
            waitlist: true,
            oauth: false,
            adminPanel: false,
            formSubmission: false
        },
        maxFileSize: 5 * 1024 * 1024,
        maxFilesPerUpload: 5,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            maxRequests: 50
        }
    }
};
// Configuración por defecto para productos no configurados
exports.DEFAULT_PRODUCT_CONFIG = {
    frontendUrl: 'https://falconcore.web.app',
    collections: {
        submissions: 'default_submissions',
        waitlist: 'default_waitlist',
        analytics_visits: 'analytics_visits', // Temporal: usar colección global
        analytics_stats: 'analytics_stats', // Temporal: usar colección global
        oauth_credentials: 'oauth_credentials',
        admin_sessions: 'admin_sessions'
    },
    storageBucket: 'falconcore-default-uploads',
    features: {
        fileUpload: false,
        documentGeneration: false,
        analytics: false,
        waitlist: false,
        oauth: false,
        adminPanel: false,
        formSubmission: false
    },
    maxFileSize: 5 * 1024 * 1024, // 5MB por defecto
    maxFilesPerUpload: 5,
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 50
    }
};
