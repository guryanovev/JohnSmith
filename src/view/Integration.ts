/// <reference path="../Common.ts"/>
/// <reference path="../command/Contracts.ts"/>
/// <reference path="../binding/Contracts.ts"/>
/// <reference path="../binding/Handling.ts"/>
/// <reference path="../binding/BindableManager.ts"/>
/// <reference path="Contracts.ts"/>
/// <reference path="DefaultViewFactory.ts"/>

module JohnSmith.View {
    export class ViewArgumentProcessor implements JohnSmith.Common.IArgumentProcessor {
        private _viewFactory: IViewFactory;

        constructor(viewFactory: IViewFactory){
            this._viewFactory = viewFactory;
        }

        public canProcess(
            argument:any,
            argumentIndex: number,
            options: any,
            context:JohnSmith.Common.IElement) : boolean {
            return argumentIndex === 1 && (!options.view)
        }

        public process(
            argument:any,
            options: any,
            context:JohnSmith.Common.IElement){

            try {
                var viewFactory = this._viewFactory;
                viewFactory.resolve(argument, null);
                options.view = argument;
            } catch(Error) {
            }
        }
    }

    export class ViewValueRenderer implements Binding.IValueRenderer {
        private _viewFactory: IViewFactory;
        private _viewDescriptor: IViewFactory;

        constructor(viewFactory: IViewFactory, viewDescriptor: IViewFactory){
            this._viewFactory = viewFactory;
            this._viewDescriptor = viewDescriptor;
        }

        public render(value: any, destination: JohnSmith.Common.IElement): Binding.IRenderedValue {
            var currentView = this._viewFactory.resolve(this._viewDescriptor, value);
            currentView.renderTo(destination);

            return {
                element: <Common.IElement>currentView.getRootElement(),
                dispose: function(){
                    currentView.dispose();
                },
                unrender: function(){
                    currentView.unrenderView();
                }
            };
        }
    }

    /////////////////////////////////
    // Config
    /////////////////////////////////

    export interface IViewDestination {
        to(target: any);
    }
}