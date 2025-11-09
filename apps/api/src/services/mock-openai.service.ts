interface MockMerchantState {
  lastPayload: any | null;
  lastReceivedAt: string | null;
  totalPushes: number;
  destinationUrl: string | null;
}

const state: MockMerchantState = {
  lastPayload: null,
  lastReceivedAt: null,
  totalPushes: 0,
  destinationUrl: null,
};

export function recordMerchantPush(payload: any, destinationUrl: string) {
  state.lastPayload = payload;
  state.lastReceivedAt = new Date().toISOString();
  state.totalPushes += 1;
  state.destinationUrl = destinationUrl;

  return state;
}

export function getMerchantStatus() {
  return {
    lastReceivedAt: state.lastReceivedAt,
    totalPushes: state.totalPushes,
    destinationUrl: state.destinationUrl,
    payloadPreview: state.lastPayload ? createPreview(state.lastPayload) : null,
  };
}

function createPreview(payload: any) {
  if (Array.isArray(payload)) {
    return {
      totalProducts: payload.length,
      sample: payload.slice(0, 2),
    };
  }

  if (payload && typeof payload === 'object') {
    return Object.keys(payload).reduce(
      (acc, key) => {
        acc[key] = Array.isArray(payload[key]) ? payload[key].length : payload[key];
        return acc;
      },
      {} as Record<string, any>
    );
  }

  return payload;
}

export function resetMerchantState() {
  state.lastPayload = null;
  state.lastReceivedAt = null;
  state.totalPushes = 0;
  state.destinationUrl = null;
  return getMerchantStatus();
}
