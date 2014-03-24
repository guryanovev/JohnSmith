/// <reference path="../libs/jquery.d.ts"/>
/// <reference path="Common.ts"/>
/// <reference path="Listeners.ts"/>
/// <reference path="Observables.ts"/>
/// <reference path="Renderers.ts"/>
/// <reference path="Dom_JQuery.ts"/>
/// <reference path="Utils.ts"/>

export interface ListenerOptions  {
    renderer?: IValueRenderer;
    formatter?: IValueFormatter;
    valueType?: string;
    fetch?: string;
    view?: any;
    type?: string;
    encode?: boolean;
    bidirectional?: boolean;
}

export interface IListener {
    <T>(observable:IObservable<T>): void;
    <T>(value:T): void;

    observes<T>(observable:IObservable<T>): void;
    observes<T>(value: T): void;
}

export interface IDom {
    (selector: string): IListenerDom;
    find(selector: string): IListenerDom;
}

export interface IListenerDom {
    $: JQuery;

    <T>(observable:IObservable<T>): void;
    <T>(value:T): void;

    observes<T>(observable:IObservable<T>): void;
    observes<T>(value: T): void;
}

export interface IContextualDom {
    (selector: string): IListenerDom;

    root: IListenerDom;

    manage(manageable: IManageable);
}

export class DomWrapper {
    constructor(
        private _rootElement: IElement,
        private _manager: IManager,
        private _renderListenerFactory: RenderListenerFactory) {
    }

    public find(selector: string): IListenerDom {
        var dom = new ListenerDom(this._rootElement.findRelative(selector), this._manager, this._renderListenerFactory);
        return <IListenerDom> Utils.wrapObjectWithSelfFunction(
            dom,
            function(d, value: any, options: any){
                d.observes(value, options);
            });
    }
}

export class ListenerDom {
    public $: JQuery;
    public text: any;
    public html: any;

    constructor(
        private _rootElement: IElement,
        private _manager: IManager,
        private _renderListenerFactory: RenderListenerFactory){

        var textConfig = new ObservationConfig(this._manager, (observable:IObservable<Object>) => this.createRenderListener(observable, { valueType: ValueType.text}));
        var htmlConfig = new ObservationConfig(this._manager, (observable:IObservable<Object>) => this.createRenderListener(observable, { valueType: ValueType.html}));

        this.$ = this._rootElement.$;
        this.text = Utils.wrapObjectWithSelfFunction(
            textConfig,
            (config:ObservationConfig, value: any) => config.observes(value));

        this.html = Utils.wrapObjectWithSelfFunction(
            htmlConfig,
            (config:ObservationConfig, value: any) => config.observes(value));
    }

    observes<T>(observable:IObservable<T>, viewClass: Function): void;
    observes<T>(observable:IObservable<T>, options: any): void;
    observes<T>(value: T, viewClass: Function): void;
    observes<T>(value: T, options?: ListenerOptions): void;
    observes(value: any, options?: ListenerOptions): void
    {
        var observable:IObservable<Object> = ListenerUtils.getObservable(value);
        var wire = this.createRenderListener(observable, options);

        this._manager.manage(wire);
    }

    private createRenderListener(observable:IObservable<Object>, options: ListenerOptions){
        return this._renderListenerFactory.createListener(observable, this._rootElement, options);
    }
}

export class ObservationConfig {
    constructor(private _manager:IManager, private factory: (observable: IObservable<Object>) => IManageable){
    }

    observes<T>(observable:IObservable<T>): void;
    observes<T>(value: T): void;
    observes(value: any): void
    {
        var observable:IObservable<Object> = ListenerUtils.getObservable(value);
        var wire = this.factory(observable);
        this._manager.manage(wire);
    }
}

class ListenerUtils {
    public static getObservable(candidate):IObservable<Object> {
        if (candidate && candidate.getValue && candidate.listen) {
            return <IObservable<Object>> candidate;
        }

        return new StaticObservableValue<Object>(candidate);
    }
}