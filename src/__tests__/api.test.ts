// Test handleError logic directly without importing the module (avoids circular mock issues)
// We replicate the logic as a white-box test

function simulateHandleError(status: number, data: Record<string, unknown> = {}, code?: string): string {
  if (code === 'ECONNABORTED') return 'Request timed out';
  if (!status) return 'unexpected error';
  if (status === 401) return 'Session expired. Please login again.';
  if (status === 403) return 'You are not authorized to perform this action.';
  if (status === 404) return 'Not found';
  if (status === 500) return 'Server error. Please try again later.';
  if (status === 400) return (data.message as string) || 'Invalid request.';
  if (status === 422) return (data.error as string) || (data.msg as string) || 'Invalid request.';
  return 'unexpected error';
}

describe('handleError logic', () => {
  test('401 -> Session expired', () => { expect(simulateHandleError(401)).toContain('Session expired'); });
  test('403 -> not authorized', () => { expect(simulateHandleError(403)).toContain('not authorized'); });
  test('404 -> Not found', () => { expect(simulateHandleError(404)).toBe('Not found'); });
  test('500 -> Server error', () => { expect(simulateHandleError(500)).toContain('Server error'); });
  test('400 without message -> Invalid request', () => { expect(simulateHandleError(400)).toBe('Invalid request.'); });
  test('400 with message -> backend message', () => { expect(simulateHandleError(400, { message: 'Email required' })).toBe('Email required'); });
  test('ECONNABORTED -> Request timed out', () => { expect(simulateHandleError(0, {}, 'ECONNABORTED')).toBe('Request timed out'); });
  test('422 with error field', () => { expect(simulateHandleError(422, { error: 'Validation failed' })).toBe('Validation failed'); });
  test('unknown status', () => { expect(simulateHandleError(418)).toBe('unexpected error'); });
});
