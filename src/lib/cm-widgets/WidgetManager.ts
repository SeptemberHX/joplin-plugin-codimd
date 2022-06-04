import type { Editor } from 'codemirror';
import _ from 'lodash';
import {WidgetType} from "./WidgetType";


export class WidgetManager {
    editor: Editor;
    unrendered;
    bindings;

    constructor(editor) {
        _.bindAll(this);

        // Prepare codemirror instance
        this.editor = editor;

        // @ts-ignore
        this.editor._widgetManager = this;
        this.unrendered = null;

        // Widgets bindings
        this.bindings = {};
    }

    doc() {
        return this.editor.getDoc();
    }

    enable() {
        const type = new WidgetType(this, null, /\$\$([^$]+)\$\$/g, function(match) {
            return {
                props: {
                    text: match[1]
                }
            };
        });
        this.bindings[type.id] = type;
        type.enable();
    }

    // Set the marker that is not rendered
    setUnrendered(_unrendered) {

    };
}