import joplin from "api";
import { SettingItemType } from "api/types";
import {
    CODIMD_EMAIL, CODIMD_PASSWORD,
    CODIMD_SERVER
} from "./common";

export namespace settings {
    const SECTION = 'FeatureSettings';

    export async function register() {
        await joplin.settings.registerSection(SECTION, {
            label: "CodiMD",
            iconName: "fas fa-share",
        });

        let PLUGIN_SETTINGS = {};

        PLUGIN_SETTINGS[CODIMD_SERVER] = {
            value: '',
            public: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'CodiMD server path',
            description: "Your CodiMD server path. http://xxx.xxx.xxx.xxx:80 for example (requires restart)",
        };

        PLUGIN_SETTINGS[CODIMD_EMAIL] = {
            value: '',
            public: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'CodiMD user email',
            description: "Your CodiMD user email (requires restart)",
        };

        PLUGIN_SETTINGS[CODIMD_PASSWORD] = {
            value: '',
            public: true,
            secure: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'CodiMD user password',
            description: "Your CodiMD user password (requires restart)",
        };

        await joplin.settings.registerSettings(PLUGIN_SETTINGS);
    }
}
