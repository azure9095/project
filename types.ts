
export interface Point {
  x: number;
  y: number;
}

export interface CalibrationData {
  p1: Point;
  p2: Point;
  realDistanceCm: number;
}

export interface FrameConfig {
  widthCm: number;
  heightCm: number;
  color: string;
  image?: string;
  id: string;
  position: Point;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  CALIBRATE = 'CALIBRATE',
  VISUALIZE = 'VISUALIZE'
}
