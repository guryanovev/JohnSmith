import { Disposable } from "../common";

export enum DataChangeReason {
    replace,
    initial,
    add,
    remove
}

export interface ChangeDetails<T> {
    reason: DataChangeReason;
    portion?: T;
}

export interface ListenerCallback<T> {
    (value: T, oldValue?: T, details?: ChangeDetails<T>): void;
}

export interface Listenable<T> {
    listen(listener:  ListenerCallback<T>, raiseInitial?: boolean): Disposable;
}

export abstract class Observable<T> implements Listenable<T> {
    abstract getValue(): T;

    abstract listen(listener:  ListenerCallback<T>, raiseInitial?: boolean): Disposable;
}