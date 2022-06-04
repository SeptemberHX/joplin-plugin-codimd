import {WidgetManager} from "./WidgetManager";
import type {Editor, TextMarker} from "codemirror";
import {WidgetUtils} from "./utils";
import _ from "lodash";
import {Widget} from "./Widget";

export class WidgetType {
    id: string;
    manager: WidgetManager;
    editor: Editor;
    opts;
    enabled: boolean;
    renderAllOnChange: boolean;
    re;
    fn: (any) => any;
    onChange;
    debounceWait;

    constructor(manager: WidgetManager, opts, re, fn) {
        this.id = _.uniqueId('widgetsType');
        this.manager = manager;
        this.editor = this.manager.editor;
        this.opts = opts || {};
        this.enabled = false;
        this.renderAllOnChange = false;
        this.re = re;
        this.fn = fn;
        this.debounceWait = 500;

        this.onChange = _.debounce(this._onChange, this.debounceWait);
    }

    doc() {
        return this.manager.doc();
    };

    enable() {
        if (this.enabled) return;

        this.enabled = true;
        this.manager.editor.on('change', this.onChange);
        this.renderAll();
    };

    // Process change from the editor
    processChange(change) {
        console.log('CM-Widgets: processChange', change);
        if (this.renderAllOnChange || change.origin == 'setValue') {
            return this.renderAll();
        }

        // Calcul range of change (change is pre-operation)
        const {length} = _.last(change.text);
        var changeRange = {
            from: WidgetUtils.Pos(change.from.line, change.from.ch),
            to: WidgetUtils.Pos(change.to.line + (change.text.length - 1), change.to.ch + length)
        };

        // Determine large range and cleanup markers in it
        var range = this.cleanupMarkers(changeRange);

        // If nothing found, find larger section to process
        if (WidgetUtils.posEqual(changeRange, range)) {
            range = this.findEditRange(changeRange);
            this.cleanupMarkers(changeRange);
        }

        // Update markers in this range
        this.processRange(range);
    };

    // Editor content changed
    // Debounce processing
    _onChange(inst, change) {
        this.processChange(change);
    };

    find(text) {
        let matches = [], found;

        this.re.lastIndex = 0;

        while ((found = this.re.exec(text)) && found) {
            const token = this.fn(found);
            if (!token) continue;
            token.start = token.start || 0;

            matches.push({
                start: found.index + token.start,
                end: found.index + found[0].length,
                props: token.props
            });
        }

        return matches;
    };

    renderAll() {
        // Extract text
        const text = this.doc().getValue();

        // Extract matches
        const matches = this.find(text);

        this.processMatches({
            line: 0,
            ch: 0
        }, matches);
    }

    processMatches(from, matches) {
        if (matches.length == 0) return;

        this.editor.operation(function() {

            const fromIndex = from ? this.editor.indexFromPos(from) : 0;
            const doc = this.doc();

            for (const match of matches) {
                const range = WidgetUtils.Range(
                    doc.posFromIndex(fromIndex + match.start),
                    doc.posFromIndex(fromIndex + match.end)
                );
                this.createWidget(range, match.props);
            }
        }.bind(this));
    }

    createWidget(range, props) {
        var that = this;
        var rejected = !this.filterMatch(range, props);
        var markers, cursor, doc, exists;

        doc = this.doc();

        // Check if the marker already exists
        markers = doc.findMarksAt(range.from);
        exists = _.find(markers, function(marker) {
            return (!marker.unrendered &&
                marker.xType == that.id &&
                that.compareProps(marker.xProps, props));
        });

        // Clear existing if rejected
        if (rejected) {
            if (exists) exists.clear();
            return;
        }

        // Don't rerender an identical widget
        if (exists) return;

        // Is cursor inside?
        cursor = doc.getCursor();
        if (WidgetUtils.posInsideRange(cursor, range)) {
            this.unrenderRange(range, props);
        } else {
            const widget = new Widget(this, range, props);

            widget.marker.on('clear', function(_from, _to) {
                if (!that.enabled) return;

                that.unrenderRange(WidgetUtils.Range(_from, _to), props);
            });

            that.prepareWidget(widget);
        }
    };

    filterMatch(range, match) {
        return true;
    }

    compareProps(p1, p2) {
        return _.isEqual(p1, p2);
    };

    // Render as text a marker
    unrenderRange(range, props) {
        const doc = this.doc();
        const marker = this.bindMarker(doc.markText(range.from, range.to), props);
        this.manager.setUnrendered(marker);
    }

    // Bind a marker to be identifiable
    bindMarker(marker, props) {
        marker.xProps = props;
        marker.xType = this.id;
        return marker;
    };

    // Create the dom element for a specific widget
    createElement(widget) {
        return document.createElement('span');
    };

    // Create a marker for a widget
    createWidgetMarker(from, to, props, opts) {
        const marker = this.doc().markText(from, to, _.extend(opts || {}, {
            clearOnEnter: true,
            atomic: true
        }));
        return this.bindMarker(marker, props);
    };

    // Prepare a widget
    // Can be extend by mixin (see "menu")
    prepareWidget(widget) {

    }

    // Cleanup all markers in a specified range
    // Return the largest range that contain markers
    cleanupMarkers(origin) {
        const that = this;
        const range = {from: origin.from, to: origin.to};

        _.each(this.doc().getAllMarks(), function(mark: TextMarker) {
            // @ts-ignore
            if (mark.xType != that.id) return;

            const markRange = mark.find();

            if (!markRange) return;

            const isInRange = WidgetUtils.isPos(markRange) ? WidgetUtils.posInsideRange(markRange, origin) : WidgetUtils.rangesOverlap(markRange, origin);
            if (!isInRange) return;

            if ('from' in markRange && WidgetUtils.posIsBefore(markRange.from, range.from)) {
                range.from = markRange.from;
            }
            if ('to' in markRange && WidgetUtils.posIsBefore(range.to, markRange.to)) {
                range.to = markRange.to;
            }

            mark.clear();
        });

        return range;
    };

    // If edition is not inside a marker, detect section to process
    // For example if the widget is inline, we can limit this to a single line
    // Should return a range
    findEditRange(range) {
        return range;
    };

    // Apply widgets in a specific sections
    processRange(range) {
        // Extract text
        var text = this.doc().getRange(range.from, range.to);

        // Extract matches
        var matches = this.find(text);

        // Process matches
        this.processMatches(range.from, matches);
    };
}