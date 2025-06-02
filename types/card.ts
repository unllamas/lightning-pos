export enum ScanCardStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  REQUESTING = 'REQUESTING',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export enum ScanAction {
  PAY_REQUEST = 'payRequest',
  INFO = 'info',
  RESET = 'reset',
  IDENTITY_QUERY = 'identityQuery',
  EXTENDED_SCAN = 'extendedScan',
}

export interface CardUrlParams {
  p: string;
  c: string;
}
