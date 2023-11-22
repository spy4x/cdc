import type { Operation } from '@stores/helpers';
import { get, writable, type Writable } from 'svelte/store';

export interface IStateList<Entity> {
  data: Entity[];
  total: number;
  page: number;
  perPage: number;
}

export interface IStateOperations {
  [operationType: string]: {
    [entityId: number]: Operation<any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
}

export interface IListState<Entity, StateList extends IStateList<Entity>, StateOperations extends IStateOperations> {
  list: StateList;
  operations: StateOperations;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const listStateInitialValue: IListState<any, IStateList<any>, IStateOperations> = {
  list: {
    data: [],
    total: 0,
    page: 0,
    perPage: 0,
  },
  operations: {},
};

export class ListStateFactory<
  Entity,
  S extends IListState<Entity, IStateList<Entity>, IStateOperations> = IListState<
    Entity,
    IStateList<Entity>,
    IStateOperations
  >,
> {
  initialValue: S;
  store: Writable<S>;

  constructor(
    initialValue: Partial<S> = {},
    list: Partial<IStateList<Entity>> = {},
    operations: Partial<IStateOperations> = {},
  ) {
    this.initialValue = {
      ...(listStateInitialValue as S),
      ...initialValue,
      list: { ...listStateInitialValue.list, ...list },
      operations: { ...listStateInitialValue.operations, ...operations },
    };
    this.store = writable<S>(this.initialValue);
  }

  mutate(state: Partial<IListState<Entity, IStateList<Entity>, IStateOperations>>): void {
    this.store.update(s => ({ ...s, ...state }));
  }
  mutateList(state: Partial<IStateList<Entity>>): void {
    this.mutate({ list: { ...get(this.store).list, ...(state as Partial<IStateList<Entity>>) } } as Partial<S>);
  }
  mutateOperation(type: keyof S['operations'], state: Partial<S['operations'][typeof type][0]>, id: number = 0): void {
    const operations: S['operations'] = get(this.store).operations;
    const entityOperationMap = operations[type];
    const entityOperation = entityOperationMap[id] ?? {};
    const operationNewState = { ...entityOperationMap, [id]: { ...entityOperation, ...state } };
    this.mutate({ operations: { ...operations, [type]: operationNewState } });
  }
  startOperation(
    type: keyof S['operations'],
    payload?: S['operations'][typeof type][0]['payload'],
    id: number = 0,
  ): void {
    this.mutateOperation(type, { payload, inProgress: true, error: undefined, result: undefined }, id);
  }
  endOperation(
    type: keyof S['operations'],
    error: S['operations'][typeof type][0]['error'],
    result?: S['operations'][typeof type][0]['result'],
    id: number = 0,
  ): void {
    this.mutateOperation(type, { inProgress: false, error, result }, id);
  }
}
