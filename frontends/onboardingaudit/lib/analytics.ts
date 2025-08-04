// frontends/onboardingaudit/lib/analytics.ts

interface TrackingData {
  projectId: string;
  page: string;
  referrer: string;
  userAgent: string;
  screenResolution: string;
  timeOnPage: number;
  scrollDepth: number;
  interactions: string[];
  sessionId?: string;
  userId?: string;
}

class AnalyticsTracker {
  private sessionId: string;
  private startTime: number;
  private interactions: string[] = [];
  private maxScrollDepth: number = 0;
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.setupTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupTracking() {
    // Track page load
    this.trackPageLoad();

    // Track scroll depth
    this.trackScrollDepth();

    // Track interactions
    this.trackInteractions();

    // Track before unload
    this.trackBeforeUnload();
  }

  private trackPageLoad() {
    const trackingData: TrackingData = {
      projectId: this.projectId,
      page: window.location.pathname,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timeOnPage: 0,
      scrollDepth: 0,
      interactions: [],
      sessionId: this.sessionId
    };

    this.sendTrackingData(trackingData);
  }

  private trackScrollDepth() {
    let lastScrollDepth = 0;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((scrollTop / documentHeight) * 100);
      
      if (scrollDepth > this.maxScrollDepth) {
        this.maxScrollDepth = scrollDepth;
      }
    });
  }

  private trackInteractions() {
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className || '';
      const id = target.id || '';
      
      // Track form interactions
      if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
        this.interactions.push(`form_field_${tagName}_${className.split(' ')[0]}`);
      }
      
      // Track button clicks
      if (tagName === 'button' || className.includes('btn')) {
        this.interactions.push(`button_click_${className.split(' ')[0]}`);
      }
      
      // Track form submissions
      if (tagName === 'form') {
        this.interactions.push('form_submit');
      }
    });

    // Track form field focus
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'select') {
        const inputElement = target as HTMLInputElement | HTMLSelectElement;
        this.interactions.push(`field_focus_${inputElement.name || 'unknown'}`);
      }
    });
  }

  private trackBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.round((Date.now() - this.startTime) / 1000);
      
      const trackingData: TrackingData = {
        projectId: this.projectId,
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timeOnPage,
        scrollDepth: this.maxScrollDepth,
        interactions: this.interactions,
        sessionId: this.sessionId
      };

      // Use sendBeacon for reliable tracking on page unload
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(trackingData)], {
          type: 'application/json'
        });
        navigator.sendBeacon('/onboardingaudit/api/public/trackVisit', blob);
      } else {
        // Fallback to synchronous request
        this.sendTrackingData(trackingData);
      }
    });
  }

  private async sendTrackingData(data: TrackingData) {
    try {
      const response = await fetch('/onboardingaudit/api/public/trackVisit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('✅ Analytics tracked successfully');
      } else {
        console.warn('⚠️ Analytics tracking failed');
      }
    } catch (error) {
      console.warn('⚠️ Analytics tracking error:', error);
    }
  }

  // Public method to track custom events
  public trackEvent(eventName: string, eventData?: Record<string, any>) {
    this.interactions.push(`custom_${eventName}`);
    
    if (eventData) {
      console.log('📊 Custom event tracked:', eventName, eventData);
    }
  }

  // Public method to track form submissions
  public trackFormSubmission(formData: any) {
    this.interactions.push('form_submission_complete');
    this.trackEvent('form_submission', { 
      hasEmail: !!formData.email,
      hasProductName: !!formData.productName,
      targetUser: formData.targetUser,
      mainGoal: formData.mainGoal
    });
  }
}

// Export singleton instance
let analyticsInstance: AnalyticsTracker | null = null;

export const initAnalytics = (projectId: string) => {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsTracker(projectId);
  }
  return analyticsInstance;
};

export const getAnalytics = () => {
  return analyticsInstance;
}; 