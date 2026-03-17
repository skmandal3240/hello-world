export const MATCH_EVENTS = {
  QUEUE_JOIN: 'queue:join',
  QUEUE_LEAVE: 'queue:leave',
  QUEUE_POSITION: 'queue:position',
  MATCH_FOUND: 'match:found',
  MATCH_ACCEPT: 'match:accept',
  MATCH_DECLINE: 'match:decline',
  MATCH_READY: 'match:ready',
  MATCH_PARTNER_DECLINED: 'match:partner_declined',
} as const;

export const SESSION_EVENTS = {
  JOIN: 'session:join',
  LEAVE: 'session:leave',
  END: 'session:end',
  ENDED: 'session:ended',
  UTTERANCE_SUBMIT: 'utterance:submit',
  UTTERANCE_RECEIVED: 'utterance:received',
  FEEDBACK_RESULT: 'feedback:result',
  FEEDBACK_ERROR: 'feedback:error',
  PARTNER_DISCONNECTED: 'partner:disconnected',
  ERROR: 'error',
} as const;
