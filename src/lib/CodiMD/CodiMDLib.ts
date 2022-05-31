import fetch from 'node-fetch';

class CodiMDLib {
    cookie: string;
    server: string;
    email: string;
    password: string;

    async init(server: string, email: string, password: string) {
        this.server = server;
        await this.login(email, password);
    }

    available() {
        return this.cookie && this.cookie.length > 0;
    }

    async login(email: string, password: string) {
        if (this.server.length === 0) {
            return;
        }

        if (!this.cookie) {
            const response = await fetch(`${this.server}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Referer': this.server
                },
                body: new URLSearchParams({
                    'email': email,
                    'password': password
                }),
                redirect: 'manual'
            });
            console.log(response.status);

            if (response.status === 302 && (await response.text()).includes('Found')) {
                this.cookie = await response.headers.raw()['set-cookie'].join('; ');
                console.log(this.cookie);
            }
        }
    }

    async loginCheck() {
        if (!this.cookie) {
            await this.login(this.email, this.password);
        }

        return !!this.cookie;
    }

    async new(title, markdownText) {
        if (!await this.loginCheck()) {
            return;
        }

        const response = await fetch(`${this.server}/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/markdown',
                'Cookie': this.cookie
            },
            body: '# ' + title + "\n\n" + markdownText,
            redirect: 'manual'
        });
        console.log(response.status);

        if (response.status === 302) {
            const text = await response.text();
            if (text.includes('Found')) {
                return text.split('/')[1];
            }
        }
        return null;
    }

    async myNotes() {
        if (!await this.loginCheck()) {
            return [];
        }

        const response = await fetch(`${this.server}/api/notes/myNotes`, {
            method: 'GET',
            headers: {
                'Cookie': this.cookie
            }
        });
        console.log(response.status);

        if (response.ok) {
            const resJson = await response.json();
            return resJson.myNotes;
        }
        return [];
    }

    async deleteNote(noteId) {
        if (!await this.loginCheck()) {
            return;
        }

        const response = await fetch(`${this.server}/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Cookie': this.cookie
            }
        });
        console.log(response.status);
    }

    async updateNote(noteId, title, markdownBody) {
        if (!await this.loginCheck()) {
            return false;
        }

        const response = await fetch(`${this.server}/api/notes/${noteId}`, {
            method: 'PUT',
            headers: {
                'Cookie': this.cookie,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'content': '# ' + title + "\n\n" + markdownBody
            })
        });
        if (response.ok) {
            const resJson = await response.json();
            return resJson.status === 'ok';
        } else {
            console.log(await response.text());
        }
        return false;
    }

    async getNote(noteId) {
        if (!await this.loginCheck()) {
            return null;
        }

        const response = await fetch(`${this.server}/socket.io/?noteId=${noteId}&transport=polling`, {
            headers: {
                'Cookie': this.cookie
            }
        });
        if (response.ok) {
            const resStr = await response.text();
            const resJson = JSON.parse(resStr.substr(resStr.search('{')));
            const response2 = await fetch(`${this.server}/socket.io/?noteId=${noteId}&transport=polling&sid=${resJson.sid}`, {
                headers: {
                    'Cookie': this.cookie
                }
            });
            if (response2.ok) {
                const resStr2 = await response2.text();
                const beginIndex = resStr2.search('"str":"') + 7;
                return resStr2.substr(beginIndex, resStr2.search('","revision"') - beginIndex);
            }
        }
        return null;
    }
}


export const codiMDLib = new CodiMDLib();
