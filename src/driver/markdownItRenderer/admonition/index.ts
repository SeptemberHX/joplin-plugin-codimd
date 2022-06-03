import admonitionPlugin from 'markdown-it-admonition'

export default function (context) {
    return {
        plugin: function (markdownIt, _options) {
            const pluginId = context.pluginId;

            _options.marker = ':';
            admonitionPlugin(markdownIt, _options);
        },
        assets: function() {
            return [
            ];
        },
    }
}