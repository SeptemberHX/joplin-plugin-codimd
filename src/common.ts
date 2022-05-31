export const SOURCE_URL_PAPERS_PREFIX = 'papers_';
export const SOURCE_URL_DIDA_PREFIX = 'dida_';
export const SOURCE_URL_CODIMD_PREFIX = 'codimd_';

export const CODIMD_SERVER = 'Codimd_Plugin_Server';
export const CODIMD_EMAIL = 'Codimd_Plugin_Email';
export const CODIMD_PASSWORD = 'Codimd_Plugin_Password';


export function extractInfo(data: string) {
    const splitResults = data.split(':');
    let info = {};
    for (const result of splitResults) {
        if (result.startsWith(SOURCE_URL_PAPERS_PREFIX)) {
            info[SOURCE_URL_PAPERS_PREFIX] = result.substr(SOURCE_URL_PAPERS_PREFIX.length);
        } else if (result.startsWith(SOURCE_URL_DIDA_PREFIX)) {
            info[SOURCE_URL_DIDA_PREFIX] = result.substr(SOURCE_URL_DIDA_PREFIX.length);
        } else if (result.startsWith(SOURCE_URL_CODIMD_PREFIX)) {
            info[SOURCE_URL_CODIMD_PREFIX] = result.substr(SOURCE_URL_CODIMD_PREFIX.length);
        }
    }
    return info;
}

export function updateInfo(raw, prefix, data) {
    let info = extractInfo(raw);
    info[prefix] = data;

    let newInfoStrs = [];
    for (let prefix in info) {
        newInfoStrs.push(`${prefix}${info[prefix]}`);
    }
    return newInfoStrs.join(':');
}