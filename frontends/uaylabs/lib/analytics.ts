// frontends/uaylabs/lib/analytics.ts

interface VisitData {
  projectId: string;
  page: string;
  referrer?: string;
  userAgent?: string;
  screenResolution?: string;
  timeOnPage?: number;
  scrollDepth?: number;
  interactions?: string[];
  sessionId?: string;
  userId?: string;
}

const analyticsCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_DURATION = 30 * 1000; // 30 segundos

const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

class AnalyticsTracker {
  private sessionId: string;
  private startTime: number;
  private projectId: string;
  private isTracking: boolean = false;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  private getScreenResolution(): string {
    return `${screen.width}x${screen.height}`;
  }

  private getReferrer(): string {
    const referrer = document.referrer;
    if (!referrer) return 'direct';
    
    try {
      const url = new URL(referrer);
      const hostname = url.hostname.toLowerCase();
      
      if (hostname.includes('google')) return 'google';
      if (hostname.includes('facebook')) return 'facebook';
      if (hostname.includes('linkedin')) return 'linkedin';
      if (hostname.includes('twitter')) return 'twitter';
      if (hostname.includes('instagram')) return 'instagram';
      if (hostname.includes('youtube')) return 'youtube';
      if (hostname.includes('tiktok')) return 'tiktok';
      
      return hostname;
    } catch {
      return 'direct';
    }
  }

  private debouncedTrack = debounce(async (visitData: VisitData) => {
    if (this.isTracking) return;
    
    const cacheKey = `${this.projectId}_${visitData.page}_${visitData.sessionId}`;
    const cached = analyticsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return;
    }

    this.isTracking = true;
    
    try {
      const response = await fetch('https://api-fu54nvsqfa-uc.a.run.app/api/public/trackVisit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      });

      if (response.ok) {
        analyticsCache.set(cacheKey, {
          timestamp: Date.now(),
          data: visitData
        });
      }
    } catch (error) {
      // Silent fail for analytics
    } finally {
      this.isTracking = false;
    }
  }, 1000);

  async trackPageVisit(page: string = 'home'): Promise<void> {
    const visitData: VisitData = {
      projectId: this.projectId,
      page,
      referrer: this.getReferrer(),
      userAgent: navigator.userAgent,
      screenResolution: this.getScreenResolution(),
      sessionId: this.sessionId,
      userId: 'anonymous'
    };

    this.debouncedTrack(visitData);
  }

  async trackPageExit(): Promise<void> {
    const timeOnPage = Date.now() - this.startTime;
    
    const visitData: VisitData = {
      projectId: this.projectId,
      page: window.location.pathname,
      timeOnPage,
      sessionId: this.sessionId,
      userId: 'anonymous'
    };

    this.debouncedTrack(visitData);
  }

  static clearCache(): void {
    analyticsCache.clear();
  }
}

export const createAnalyticsTracker = (projectId: string): AnalyticsTracker => {
  return new AnalyticsTracker(projectId);
};

export default AnalyticsTracker;
