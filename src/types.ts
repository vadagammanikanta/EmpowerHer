export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  flow?: 'light' | 'medium' | 'heavy';
  symptoms?: string[];
  mood?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface HealthStatus {
  status: 'Unknown' | 'Regular' | 'Irregular';
  message: string;
  description: string;
  averageCycleLength?: number;
  variance?: number;
}
