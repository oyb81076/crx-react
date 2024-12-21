export type CaptrueRequest =
  | CaptureStartRequest
  | CaptureNextRequest
  | CaptureCompleteRequest
  | GetCaptureRectRequest;
;

export interface CaptureCompleteRequest {
  type: 'capture_complete';
  dataUrl: string;
  x: number;
  y: number;
  h: number;
  w: number;
  dpr: number;
}

// background.js 通知客户端开时截屏
export interface CaptureStartRequest {
  type: 'capture_start';
  mode: 'rect' | 'full';
}

export interface CaptureNextRequest {
  type: 'capture_next';
}

// content 通知 background.js 进行截屏
export interface CaptureNextResponse {
  error?: string;
  hasNext: boolean;
  scale: number; // window.devicePixelRatio
  x: number; // 截屏开始的x坐标
  y: number; // 截屏开始的y坐标
  height: number; // 截屏区域高度
  width: number; // 截屏区域宽度
}
export interface GetCaptureRectRequest {
  type: 'get_capture_rect';
}
export interface GetCaptureRectResponse {
  rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  } | null;
  dpr: number;
}
