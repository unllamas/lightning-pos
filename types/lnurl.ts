export interface LNURLResponse {
  tag: string;
  callback: string;
  k1?: string;
  metadata?: string;
  commentAllowed?: number;
  minWithdrawable?: number;
  maxWithdrawable?: number;
  minSendable?: number;
  maxSendable?: number;
  payerData?: { [_key: string]: { mandatory: boolean } };
  defaultDescription?: string;
  nostrPubkey?: string;
  allowsNostr?: boolean;
  accountPubKey?: string;
  federationId?: string;
}

export interface LNURLInvoiceResponseSuccess {
  pr: string;
  routes?: string[];
  verify?: string;
}

export interface LNURLInvoiceResponseError {
  status: string;
  reason: string;
}

export type LNURLInvoiceResponse = LNURLInvoiceResponseSuccess | LNURLInvoiceResponseError;

export type LNURLVerifyResponseSuccess = {
  status: 'OK';
  settled: boolean;
  preimage: string | null;
  pr: string;
};

export type LNURLVerifyResponseError = {
  status: 'ERROR';
  reason: string;
};

export type LNURLVerifyResponse = LNURLVerifyResponseSuccess | LNURLVerifyResponseError;

export enum LNURLWStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  REQUESTING = 'REQUESTING',
  CALLBACK = 'CALLBACK',
  DONE = 'DONE',
  ERROR = 'ERROR',
}
