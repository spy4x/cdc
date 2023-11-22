import { browser } from '$app/environment';
import type {
  DesiredDay,
  DesiredDayBase,
  DesiredDayCreate,
  RequestError,
  ResponseList,
  ValidationError,
} from '@shared';
import {
  handleRequestError,
  handleValidationError,
  DesiredDaySchema,
  USER_ID_COOKIE_NAME,
  DesiredDayCompareFields,
} from '@shared';
import { get } from 'svelte/store';
import { auth } from '@stores/auth.store';
import { type Operation, request, type RequestHelperError, toastStore } from './helpers';
import { addBreadcrumb, captureException } from '@sentry/sveltekit';
import { type IListState, type IStateList, type IStateOperations, ListStateFactory } from '@stores/listStateFactory';

interface StateOperations extends IStateOperations {
  create: { [is: number]: Operation<DesiredDay, DesiredDay, ValidationError<typeof DesiredDaySchema> | RequestError> };
  update: { [is: number]: Operation<DesiredDay, DesiredDay, ValidationError<typeof DesiredDaySchema> | RequestError> };
  merge: { [is: number]: Operation<DesiredDay, DesiredDay, ValidationError<typeof DesiredDaySchema> | RequestError> };
  delete: { [is: number]: Operation<DesiredDay, void, ValidationError<typeof DesiredDaySchema> | RequestError> };
  load: { [is: number]: Operation<void, DesiredDay[], RequestHelperError> };
}

const listState = new ListStateFactory<DesiredDay, IListState<DesiredDay, IStateList<DesiredDay>, StateOperations>>(
  {},
  {},
  {
    load: { 0: {} },
    save: { 0: {} },
    create: { 0: {} },
    update: { 0: {} },
    delete: { 0: {} },
  },
);

export const desiredDays = {
  subscribe: listState.store.subscribe,
  fetchList: async (): Promise<void> => {
    if (get(listState.store).operations.load[0].inProgress) {
      return;
    }
    listState.startOperation('load');
    const [error, list] = await request<DesiredDay[]>('/api/desired-days');
    addBreadcrumb({
      category: 'desiredDays',
      message: `fetchList was ${error ? 'unsuccessful' : 'successful'}`,
      level: error ? 'error' : 'info',
      data: {
        error,
        items: list?.length,
      },
    });

    if (!error) {
      listState.mutateList({
        data: list ?? [],
        total: list.length ?? 0,
        page: 0,
        perPage: list.length ?? 0,
      });
    }
    listState.endOperation('load', error, list);
  },
  save: async (newData: DesiredDayBase[], oldData: DesiredDay[]): Promise<void> => {
    const state = get(listState.store);
    if (state.operations.save[0].inProgress) {
      return;
    }
    listState.startOperation('save', { newData, oldData }, 0);

    // compare newData and oldData to find out what changed (compare by "dateOfWeek" field, which is unique index):
    // create what is missing in oldData
    // update what is different in oldData
    // delete what is missing in newData, but present in oldData
    const toCreate: DesiredDayBase[] = [];
    const toUpdate: DesiredDay[] = [];
    const toDelete: DesiredDay[] = [];
    newData.forEach(item => {
      const oldItem = oldData.find(oldItem => oldItem.dayOfWeek === item.dayOfWeek);
      if (oldItem) {
        // compare only fields from DesiredDayCompareFields
        DesiredDayCompareFields.forEach(field => {
          if (oldItem[field] !== item[field] && !toUpdate.find(item => item.dayOfWeek === oldItem.dayOfWeek)) {
            toUpdate.push({ ...oldItem, ...item });
          }
        });
      } else {
        toCreate.push(item);
      }
    });
    oldData.forEach(item => {
      const newItem = newData.find(newItem => newItem.dayOfWeek === item.dayOfWeek);
      if (!newItem) {
        toDelete.push(item);
      }
    });
    //execute operations
    let error: null | Error = null;
    try {
      const operations: Promise<void>[] = [];
      toCreate.forEach(item => operations.push(desiredDays.create(item)));
      toUpdate.forEach(item => operations.push(desiredDays.update(item)));
      toDelete.forEach(item => operations.push(desiredDays.delete(item.id)));
      await Promise.all(operations);
      listState.endOperation('save', undefined, undefined, 0);
    } catch (err: unknown) {
      listState.endOperation('save', error, undefined, 0);
      error = err as Error;
      console.error(error);
    }
    // await desiredDays.fetchList();

    addBreadcrumb({
      category: 'desiredDays',
      message: `DesiredDay update ${error ? 'failed' : 'successful'}`,
      level: error ? 'error' : 'info',
    });

    if (error) {
      captureException(error);
    }

    if (error) {
      toastStore.trigger({
        message: 'DesiredDay save failed',
        background: 'bg-roley-orange',
      });
    } else {
      toastStore.trigger({
        message: 'DesiredDay saved successfully',
        background: 'bg-roley-green',
      });
    }
  },
  create: async (desiredDay: DesiredDayCreate): Promise<void> => {
    const state = get(listState.store);
    listState.startOperation('create', desiredDay);

    const [error, createdDesiredDay] = await request<DesiredDay>('/api/desired-days', 'POST', desiredDay);
    addBreadcrumb({
      category: 'desiredDays',
      message: `Create was ${error ? 'unsuccessful' : 'successful'}`,
      level: error ? 'error' : 'info',
      data: {
        error,
        desiredDayId: createdDesiredDay?.id,
      },
    });

    if (createdDesiredDay) {
      listState.mutateList({
        data: [...state.list.data, createdDesiredDay],
      });
      toastStore.trigger({
        message: 'DesiredDay created successfully',
        background: 'bg-roley-green',
      });
    } else {
      toastStore.trigger({
        message: 'DesiredDay creation failed',
        background: 'bg-roley-orange',
      });
    }
    listState.endOperation('create', error ? handleRequestError(error) : undefined, createdDesiredDay || undefined);
  },
  update: async (desiredDay: DesiredDay): Promise<void> => {
    listState.startOperation('update', desiredDay, desiredDay.id);

    let parseResult = DesiredDaySchema.safeParse(desiredDay);
    if (!parseResult.success) {
      listState.endOperation('update', handleValidationError(parseResult.error), undefined, desiredDay.id);

      toastStore.trigger({
        message: 'Check fields correctness',
        background: 'bg-roley-orange',
      });
      return;
    }

    parseResult = DesiredDaySchema.safeParse(desiredDay);
    if (!parseResult.success) {
      listState.endOperation('update', handleValidationError(parseResult.error), undefined, desiredDay.id);
      toastStore.trigger({
        message: 'Check fields correctness',
        background: 'bg-roley-orange',
      });
      return;
    }
    const payload = parseResult.data;

    const [error, updatedDesiredDay] = await request<DesiredDay>(
      `/api/desired-days/${desiredDay.id}`,
      'PATCH',
      payload,
    );

    addBreadcrumb({
      category: 'desiredDays',
      message: `DesiredDay update ${error ? 'failed' : 'successful'}`,
      level: error ? 'error' : 'info',
      data: {
        desiredDayId: updatedDesiredDay?.id,
      },
    });

    if (error) {
      captureException(error);
    }

    listState.endOperation(
      'update',
      error ? handleRequestError(error) : undefined,
      updatedDesiredDay || undefined,
      desiredDay.id,
    );

    if (updatedDesiredDay) {
      listState.mutateList({
        data: get(listState.store).list.data.map(item => (item.id === updatedDesiredDay.id ? updatedDesiredDay : item)),
      });
      toastStore.trigger({
        message: 'DesiredDay saved successfully',
        background: 'bg-roley-green',
      });
    } else {
      toastStore.trigger({
        message: 'DesiredDay save failed',
        background: 'bg-roley-orange',
      });
    }
  },

  delete: async (id: number): Promise<void> => {
    const state = get(listState.store);
    const desiredDay = state.list.data.find(item => item.id === id);
    if (!desiredDay) {
      toastStore.trigger({
        message: `DesiredDay "${id}" not found`,
        background: 'bg-roley-orange',
      });
      return;
    }

    listState.startOperation('delete', desiredDay, id);

    const [error] = await request(`/api/desired-days/${id}`, 'DELETE');
    addBreadcrumb({
      category: 'desiredDays',
      message: `DesiredDay deletion ${error ? 'failed' : 'successful'}`,
      level: error ? 'error' : 'info',
      data: {
        desiredDayId: id,
        error,
      },
    });
    listState.endOperation('delete', error ? handleRequestError(error) : undefined, undefined, id);
    if (error) {
      toastStore.trigger({
        message: 'DesiredDay deletion failed',
        background: 'bg-roley-orange',
      });
    } else {
      state.list.data = state.list.data.filter(item => item.id !== id);
      listState.mutateList({
        data: state.list.data.filter(item => item.id !== id),
      });
      toastStore.trigger({
        message: 'DesiredDay deleted successfully',
        background: 'bg-roley-green',
      });
    }
  },
};

function init() {
  // if cookie with user.id exists - fetch user
  if (!browser) {
    return;
  }
  if (document.cookie.includes(USER_ID_COOKIE_NAME)) {
    void desiredDays.fetchList();
  }

  auth.onAuthStateChange(user => {
    if (user) {
      const state = get(desiredDays);
      if (!state.operations.load[0].result) {
        void desiredDays.fetchList();
      }
    } else {
      listState.mutate(listState.initialValue);
    }
  });
}

init();
