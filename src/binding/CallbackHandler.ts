/// <reference path="Contracts.ts"/>
/// <reference path="BindableManager.ts"/>

module JohnSmith.Binding {
    var CALLBACK_HANDLER_KEY = "callback";

    export class CallbackHandler implements IBindableHandler, IBindableListener {
        private _callback: (value:any, oldValue:any, changeType: DataChangeReason) => void;

        constructor(callback: (value:any, oldValue:any, changeType: DataChangeReason) => void){
            this._callback = callback;
        }

        public wireWith(bindable: IBindable) {
            bindable.addListener(this);
            this.invokeCallback(null, bindable.getValue(), DataChangeReason.replace)
        }

        public unwireWith(bindable: IBindable) {
            bindable.removeListener(this);
        }

        public valueChanged(oldValue: Object, newValue: Object, changeType: DataChangeReason) {
            this.invokeCallback(oldValue, newValue, changeType);
        }

        private invokeCallback(oldValue: any, newValue: any, changeType: DataChangeReason){
            // context should be 'window' by default
            // so 'native' functions like 'alert' would work correctly
            var context = window;

            this._callback.call(context, newValue, oldValue, changeType);
        }

        public dispose(): void {
        }
    }

    export class CallbackArgumentProcessor implements JohnSmith.Common.IArgumentProcessor {
        public canProcess(argument:any, argumentIndex: number, options: any, context:JohnSmith.Common.IElement):boolean{
            return argumentIndex == 0 &&
                (options.handler == null || options.handler == CALLBACK_HANDLER_KEY) &&
                (options.callback == null) &&
                JohnSmith.Common.TypeUtils.isFunction(argument);
        }

        public process(argument:any, options: any, context:JohnSmith.Common.IElement){
            options.handler = "callback";
            options.callback = argument;
        }
    }

    export class CallbackHandlerFactory implements IHandlerFactory {
        public createHandler(options: any, bindable: IBindable, context: JohnSmith.Common.IElement, commandHost: Command.ICommandHost): IBindableHandler {
            if (options && options.handler === "callback") {
                return new Binding.CallbackHandler(options.callback);
            }

            return null;
        }
    }
}