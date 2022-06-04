import {WidgetManager} from "../../../lib/cm-widgets/WidgetManager";
var widgets = require('codemirror-widgets');
var katex = require('katex');


module.exports = {
    default: function(_context) {
        return {
            plugin: function (CodeMirror) {
                CodeMirror.defineOption("codemirrorMath", [], async function(cm, val, old) {
                    // Create a widgets manager connected to an editor
                    // var manager = new WidgetManager(cm);
                    // manager.enable();

                    // Create a type of widget
                    var WidgetMath = widgets.createType({
                        mixins: [
                            widgets.mixins.re(/\$\$([^$]+)\$\$/g, function(match) {
                                return {
                                    props: {
                                        text: match[1]
                                    }
                                };
                            }),
                            widgets.mixins.editParagraph()
                        ],

                        createElement: function(widget) {
                            // Create the spam to replace the formula
                            var span = document.createElement('span');

                            // Render the formula using katex
                            katex.render(widget.props.text, span, {
                                displayMode: true,
                                output: 'html',
                                throwOnError: true
                            });

                            return span;
                        }
                    });

                    var WidgetMat2 = widgets.createType({
                        mixins: [
                            widgets.mixins.re(/\$([^$]+)\$/g, function(match) {
                                return {
                                    props: {
                                        text: match[1]
                                    }
                                };
                            }),
                            widgets.mixins.editParagraph()
                        ],

                        createElement: function(widget) {
                            // Create the spam to replace the formula
                            var span = document.createElement('span');

                            // Render the formula using katex
                            katex.render(widget.props.text, span, {
                                displayMode: false,
                                output: 'html',
                                throwOnError: true
                            });

                            return span;
                        }
                    });



                    // Create a widgets manager connected to an editor
                    var manager = widgets.createManager(cm);

                    // Connect a type of widget to the manager
                    manager.enable(WidgetMath);
                    manager.enable(WidgetMat2);
                });
            },
            codeMirrorOptions: { 'codemirrorMath': true },
            assets: function() {
                return [
                    {
                        name: "katex.min.css"
                    }
                ];
            }
        }
    },
}
