import joplin from 'api';
import {settings} from "./settings";
import {
	CODIMD_EMAIL,
	CODIMD_PASSWORD,
	CODIMD_SERVER,
	extractInfo,
	SOURCE_URL_CODIMD_PREFIX,
	updateInfo
} from "./common";
import {codiMDLib} from "./lib/CodiMD/CodiMDLib";
import {ContentScriptType, ToolbarButtonLocation} from "../api/types";

joplin.plugins.register({
	onStart: async function() {
		await settings.register();

		const codimd_server = await joplin.settings.value(CODIMD_SERVER);
		const codimd_email = await joplin.settings.value(CODIMD_EMAIL);
		const codimd_password = await joplin.settings.value(CODIMD_PASSWORD);

		await codiMDLib.init(codimd_server, codimd_email, codimd_password);

		await joplin.commands.register({
			name: "CodiMD_Upload",
			label: "Upload to CodiMD",
			iconName: "fa fa-arrow-up",
			execute: async () => {
				if (!codiMDLib.available()) {
					return;
				}

				const currNote = await joplin.workspace.selectedNote();
				let remoteUrl = codiMDLib.server;
				if (currNote) {
					const infos = extractInfo(currNote.source_url);
					let newBody = currNote.body;
					const r = /!\[.*\]\(\s*(:\/\S+)\s*\)/gm;
					let match;
					while ((match = r.exec(newBody)) !== null) {
						const joplinImageId = match[1];
						const filePath = await joplin.data.resourcePath(joplinImageId.substr(2));
						if (filePath) {
							const uploadImagePath = await codiMDLib.uploadImage(filePath);
							if (uploadImagePath) {
								newBody.replaceAll(joplinImageId, uploadImagePath);
							}
						}
					}

					if (SOURCE_URL_CODIMD_PREFIX in infos) {
						await codiMDLib.updateNote(infos[SOURCE_URL_CODIMD_PREFIX], currNote.title, newBody);
						remoteUrl += `/${infos[SOURCE_URL_CODIMD_PREFIX]}`;
					} else {
						const codiMdId = await codiMDLib.new(currNote.title, newBody);
						if (codiMdId) {
							const new_source_url = updateInfo(currNote.source_url, SOURCE_URL_CODIMD_PREFIX, codiMdId);
							await joplin.data.put(['notes', currNote.id], null, {source_url: new_source_url});
						}
						remoteUrl += `/${codiMdId}`;
					}
					await joplin.clipboard.writeText(remoteUrl);
				}
			},
		});

		await joplin.commands.register({
			name: "CodiMD_Sync_Back",
			label: "Sync from CodiMD to note",
			iconName: "fa fa-arrow-down",
			execute: async () => {

			},
		});

		await joplin.views.toolbarButtons.create(
			'CodiMDUpload',
			'CodiMD_Upload',
			ToolbarButtonLocation.NoteToolbar
		);

		await joplin.views.toolbarButtons.create(
			'CodiMDSyncBack',
			'CodiMD_Sync_Back',
			ToolbarButtonLocation.NoteToolbar
		);

		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			'codimd_style_renderer',
			'./driver/markdownItRenderer/admonition/index.js'
		);
	},
});
