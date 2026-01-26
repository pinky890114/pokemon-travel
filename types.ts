export interface TripSettings {
  title: string;
  subtitle: string;
  startDate: string;
}

export interface FlightSegment {
  id?: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  depTime: string;
  arrTime: string;
  date: string;
  duration: string;
  airline: string;
  flight: string;
  depTerminal: string;
  arrTerminal: string;
  gate: string;
  seat: string;
  class: string;
  baggage: string;
  layover?: string;
}

export interface FlightData {
  outbound: FlightSegment[];
  inbound: FlightSegment[];
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  bookingCode?: string;
  image: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  createdAt?: any;
}

export interface ItineraryEvent {
  id?: string;
  date: string;
  time: string;
  title: string;
  location: string;
  type: 'event' | 'transport';
  transportMode?: 'walk' | 'train' | 'car' | 'bus';
  duration?: string;
  cost?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Expense {
  id?: string;
  amount: number;
  item: string;
  payer: string;
  date: string;
  createdAt?: any;
}

export interface Member {
  id: string;
  name: string;
  themeIdx: number;
  img: string;
}

export interface WeatherInfo {
  name: string;
  temp: number;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon: string;
  type: string;
  sunrise: string;
  sunset: string;
}

export interface Theme {
  name: string;
  color: string;
  border: string;
  text: string;
  bgLight: string;
  id: number;
}