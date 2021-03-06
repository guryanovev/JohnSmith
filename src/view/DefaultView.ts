/// <reference path="../Common.ts"/>
/// <reference path="../Events.ts"/>
/// <reference path="../binding/Contracts.ts"/>
/// <reference path="../command/Contracts.ts"/>
/// <reference path="Contracts.ts"/>

module JohnSmith.View {
    export interface IChildView {
        child: IView;
        destination: any;
        viewModel: any;
    }

    export class DefaultView implements IView, IViewContext, Command.ICommandHost {
        /** Read only fields */
        private _elementFactory: Common.IElementFactory;
        private _bindableManager: Binding.IBindableManager;
        private _commandManager: Command.ICommandManager;
        private _eventBus: Common.IEventBus;
        private _viewModel:IViewModel;
        private _data:IViewData;
        private _viewFactory:IViewFactory;
        private _markupResolver:Common.IMarkupResolver;

        /** Regular fields */
        private _children: IChildView[];
        private _rootElement: JohnSmith.Common.IElement;
        private _bindings: Binding.BindingConfig[];
        private _commands: Command.CommandConfig[];
        private _unrender: Events.Event<IViewContext>;

        constructor (
            bindableManager: Binding.IBindableManager,
            commandManager: Command.ICommandManager,
            elementFactory: Common.IElementFactory,
            viewData: IViewData,
            viewModel:IViewModel,
            eventBus: Common.IEventBus,
            viewFactory: IViewFactory,
            markupResolver: Common.IMarkupResolver){

            this._bindableManager = bindableManager;
            this._commandManager = commandManager;
            this._elementFactory = elementFactory;
            this._data = viewData;
            this._viewModel = viewModel;
            this._eventBus = eventBus;
            this._viewFactory = viewFactory;
            this._markupResolver = markupResolver;

            this._bindings = [];
            this._commands = [];
            this._unrender = new Events.Event<IViewContext>();
        }

        // todo write tests for this
        public find(query: string): JohnSmith.Common.IElement {
            return this.getRootElement().findRelative(query);
        }

        public addChild(destination:any, child:IView, viewModel: any){
            if (!this.hasChildren()) {
                this._children = [];
            }

            this._children.push({
                child: child,
                destination: destination,
                viewModel: viewModel
            });
        }

        // todo write tests for this
        public attachTo(destination:any):void {
            var destinationElement = typeof destination == "string" ?
                this._elementFactory.createElement(destination) :
                destination;

            this.attachViewToRoot(destinationElement);
        }

        public renderTo(destination:any):void {
            var templateHtml = this._markupResolver.resolve(this._data.template);

            var destinationElement = typeof destination == "string" ?
                this._elementFactory.createElement(destination) :
                destination;

            var root = destinationElement.appendHtml(templateHtml);

            this.attachViewToRoot(root);
        }

        public onUnrender():Events.IEvent<IViewContext> {
            return this._unrender;
        }

        private attachViewToRoot(root: JohnSmith.Common.IElement):void {
            this._rootElement = root;

            this._eventBus.trigger(
                "viewRendered",
                {
                    root: this._rootElement,
                    view: this
                });

//            if (this._data.init || this._data.unrender){
//                for (var field in this._data){
//                    if (this[field] === undefined){
//                        this[field] = this._data[field];
//                    }
//                }
//            }

            if (this._data.init){
                this._data.init(this, this._viewModel);
            }

            /* Init bindings */
            for (var i = 0; i < this._bindings.length; i++) {
                this._bindings[i].init();
            }

            if (this.hasChildren()){
                for (var i = 0; i < this._children.length; i++) {
                    var childData = this._children[i];
                    var viewModel = childData.viewModel;
                    var child = this._viewFactory.resolve(childData.child, viewModel);
                    child.renderTo(this._rootElement.findRelative(childData.destination));
                }
            }

            if (this._viewModel && this._viewModel.initState){
                this._viewModel.initState();
            }
        }

        public bind(bindable: any): Binding.BindingConfig {
            var binding = new Binding.BindingConfig(
                this._bindableManager,
                bindable,
                this._rootElement,
                this,
                false);

            this._bindings.push(binding);

            return  binding;
        }

        public on(...causeArguments: any[]): Command.CommandConfig {
            var commandConfig = new Command.CommandConfig(
                causeArguments,
                this._commandManager,
                this.getRootElement(),
                this._viewModel);

            this._commands.push(commandConfig);

            return  commandConfig;
        }

        public getRootElement() : JohnSmith.Common.IElement {
            return this._rootElement;
        }

        public unrenderView() {
            if (this._unrender.hasListeners()){
                this._unrender.trigger(this);
            } else {
                this.getRootElement().remove();
            }
//            if (this._data.unrender) {
//                this._data.unrender();
//            } else {
//                this.getRootElement().remove();
//            }
        }

        public dispose(): void {
            this.unrenderView();

            /* release viewModel state before disposing
            *  to make sure the model will not attempt to use bindables */
            if (this._viewModel && this._viewModel.releaseState){
                this._viewModel.releaseState();
            }

            /* dispose children */
            if (this.hasChildren()){
                for (var i = 0; i < this._children.length; i++){
                    this._children[i].child.dispose();
                }
            }

            /* dispose bindings */
            for (var i = 0; i < this._bindings.length; i++) {
                this._bindings[i].dispose();
            }

            /* dispose commands */
            for (var i = 0; i < this._commands.length; i++) {
                this._commands[i].dispose();
            }
        }

        private hasChildren():boolean {
            return this._children != null;
        }
    }
}