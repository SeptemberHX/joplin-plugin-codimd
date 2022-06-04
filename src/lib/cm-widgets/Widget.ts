import _ from 'lodash';
import {Doc, Editor} from "codemirror";
import {WidgetType} from "./WidgetType";

export class Widget {
    originalRange;
    type: WidgetType;
    ctx;
    props;
    doc: Doc;
    editor: Editor;
    el: Element;
    marker;

    constructor(type, originalRange, props) {
        _.bindAll(this);

        this.originalRange = originalRange;
        this.type = type;
        this.ctx = this.type.opts;
        this.props = props;

        this.doc = this.type.doc();
        this.editor = this.doc.getEditor();

        // Create DOM element
        this.el = this.type.createElement(this);
        this.el.className = this.el.className + ' cm-widget';

        // Create codemirror marker
        this.marker = this.type.createWidgetMarker(this.originalRange.from, this.originalRange.to, this.props, {
            replacedWith: this.el
        });
    }
}
