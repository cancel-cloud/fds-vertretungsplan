import { WebUntisRequest, WebUntisResponse } from '@/types';

const API_BASE_URL = 'https://hepta.webuntis.com/WebUntis/monitor/substitution/data';
const SCHOOL_NAME = 'dessauer-schule-limburg';

// Convert Date to YYYYMMDD format for API
const formatDateForAPI = (date: Date): number => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`);
};

// Default request configuration
const createDefaultRequest = (date: Date): WebUntisRequest => ({
  formatName: 'Web-Schüler-heute',
  schoolName: SCHOOL_NAME,
  date: formatDateForAPI(date),
  dateOffset: 0,
  activityTypeIds: [],
  departmentElementType: -1,
  departmentIds: [],
  enableSubstitutionFrom: false,
  groupBy: 1,
  hideAbsent: false,
  hideCancelCausedByEvent: false,
  hideCancelWithSubstitution: true,
  mergeBlocks: true,
  showAbsentElements: [],
  showAbsentTeacher: true,
  showAffectedElements: [1],
  showBreakSupervisions: false,
  showCancel: true,
  showClass: true,
  showEvent: true,
  showExamSupervision: false,
  showHour: true,
  showInfo: true,
  showMessages: true,
  showOnlyCancel: false,
  showOnlyFutureSub: true,
  showRoom: true,
  showStudentgroup: false,
  showSubject: true,
  showSubstText: true,
  showSubstTypeColor: false,
  showSubstitutionFrom: 0,
  showTeacher: true,
  showTeacherOnEvent: false,
  showTime: true,
  showUnheraldedExams: false,
  showUnitTime: false,
  strikethrough: true,
  strikethroughAbsentTeacher: true,
});

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
};

// Sleep utility for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async makeRequest(
    url: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new ApiError({
          message: `HTTP error! status: ${response.status}`,
          status: response.status,
          code: 'HTTP_ERROR',
        });
      }
      
      return response;
    } catch (error) {
      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, retryCount),
          RETRY_CONFIG.maxDelay
        );
        
        console.warn(`Request failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
        await sleep(delay);
        
        return this.makeRequest(url, options, retryCount + 1);
      }
      
      // If all retries failed, throw the original error
      if (error instanceof Error) {
        throw new ApiError({
          message: error.message,
          code: 'NETWORK_ERROR',
        });
      }
      
      throw new ApiError({
        message: 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
      });
    }
  }

  async fetchSubstitutions(date: Date): Promise<WebUntisResponse> {
    const request = createDefaultRequest(date);
    
    // Note: In a real implementation, you would need to handle authentication
    // The original request included cookies for session management
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    const requestOptions: RequestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      mode: 'cors', // This might need to be handled by a proxy in production
    };

    const url = `${API_BASE_URL}?school=${SCHOOL_NAME}`;
    
    try {
      const response = await this.makeRequest(url, requestOptions);
      const data: WebUntisResponse = await response.json();
      
      return data;
    } catch (error) {
      console.error('Failed to fetch substitutions:', error);
      throw error;
    }
  }

  // Parse HTML content from API responses
  static parseHtmlContent(content: string): string {
    // Remove HTML tags and decode entities
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&auml;/g, 'ä')
      .replace(/&ouml;/g, 'ö')
      .replace(/&uuml;/g, 'ü')
      .replace(/&Auml;/g, 'Ä')
      .replace(/&Ouml;/g, 'Ö')
      .replace(/&Uuml;/g, 'Ü')
      .replace(/&szlig;/g, 'ß')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  // Extract substitution type from API data
  static extractSubstitutionType(data: string[], cellClasses: Record<string, string[]>): string {
    const typeText = data[6] || '';
    
    // Check if it's a cancellation based on cell classes
    const hasCancelStyle = Object.values(cellClasses).some(classes => 
      classes.includes('cancelStyle')
    );
    
    if (hasCancelStyle || typeText.includes('Entfall')) {
      return 'Entfall';
    }
    
    if (typeText.includes('Raumänderung') || typeText.includes('Raum')) {
      return 'Raumänderung';
    }
    
    if (typeText.includes('Vertretung')) {
      return 'Vertretung';
    }
    
    if (typeText.includes('Verlegung')) {
      return 'Verlegung';
    }
    
    if (typeText.includes('Sondereinsatz')) {
      return 'Sondereinsatz';
    }
    
    if (typeText.includes('EVA')) {
      return 'EVA';
    }
    
    if (typeText.includes('Klausur')) {
      return 'Klausur';
    }
    
    if (typeText.includes('Freisetzung')) {
      return 'Freisetzung';
    }
    
    return typeText || 'Sonstiges';
  }
}

// Custom error class for API errors
class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor({ message, status, code }: { message: string; status?: number; code?: string }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export default ApiService.getInstance();
export { ApiError, formatDateForAPI }; 