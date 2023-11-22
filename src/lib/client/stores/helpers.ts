import type { AsyncOperationProgress } from '@shared';

export * from './listStateFactory';

export interface Operation<P, R, E = string> {
  payload?: P;
  inProgress?: boolean;
  error?: E;
  result?: R;
  progress?: AsyncOperationProgress | undefined;
}

export interface RequestHelperError {
  status: number;
  body: { message?: string; [key: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function request<T>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  payload?: unknown,
): Promise<[null, T] | [RequestHelperError, null]> {
  try {
    const extraParams: { body?: string; headers?: { [key: string]: string } } = {};

    if (payload) {
      if (method === 'GET') {
        // put payload into query string
        const params = new URLSearchParams(payload as Record<string, string>);
        url += `?${params.toString()}`;
        extraParams.body = undefined;
      } else {
        extraParams.body = JSON.stringify(payload);
        extraParams.headers = {
          'Content-Type': 'application/json',
        };
      }
    }

    const response = await fetch(url, {
      method,
      ...extraParams,
    });
    const json = await response.json();
    if (response.ok) {
      return [null, json];
    } else {
      return [{ status: response.status, body: json }, null];
    }
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return [{ status: 501, body: error }, null];
    }
    return [{ status: 501, body: { message: 'Unknown error' } }, null];
  }
}

export function trackUploadProgress(
  type: string,
  entityId: number,
  state: {
    operations: Record<number, { progress?: AsyncOperationProgress }>;
  },
  mutateOperation: (type: string, mutation: Partial<{ progress: AsyncOperationProgress }>, entityId: number) => void,
  {
    id,
    percentage,
  }: {
    id: number;
    percentage: number;
  },
) {
  const operation = state.operations[entityId];
  if (!operation) {
    return;
  }
  if (!operation.progress) {
    operation.progress = {
      percentage: 0,
      details: [],
    };
  }
  const details = operation.progress.details.find(d => d.id === id);
  if (!details) {
    operation.progress.details.push({ id, percentage });
  } else {
    details.percentage = percentage;
  }
  operation.progress.percentage = Math.round(
    operation.progress.details.reduce((acc, cur) => acc + cur.percentage, 0) / operation.progress.details.length,
  );

  mutateOperation(type, { progress: operation.progress }, entityId);
}

export const toastStore = {
  trigger: (data: unknown) => {
    console.log(`Toast:`, data);
  },
};
