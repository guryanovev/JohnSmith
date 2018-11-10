import { Listenable } from '../../reactive';
import { ViewDefinition,  RenderingContext } from '../view-definition';
import { ViewRenderer } from '../view-renderer';
import { DomElement } from '../element';
import { AbstractListenableConnector } from './abstract';

export class ObservableValueViewConnector<T> extends AbstractListenableConnector<T> {
    constructor(
        source: Listenable<T>|T,
        target: DomElement,
        view: ViewDefinition<any>,
        _viewRenderer: ViewRenderer,
        renderingContext: RenderingContext) {

        super(source, (value: any) => {
            if (value !== null)
            {
                return _viewRenderer.render(target, view, value, renderingContext);
            }

            return null;
        });
    }
}