export type CaptrueRequest =
  | CaptureStartRequest
  | CaptureNextRequest
  | CaptureCompleteRequest
  ;

export interface CaptureCompleteRequest {
  type: 'capture_complete';
  payload: string; // base64url
}

// background.js 通知客户端开时截屏
export interface CaptureStartRequest {
  type: 'capture_start';
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
