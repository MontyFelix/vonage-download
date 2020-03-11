const axios = require('axios');
const qs = require('qs');
const fs = require('fs');

class IcsClient {

    /***
     * @param clientId API client ID
     * @param clientSecret API secret
     * @param region one of: 'emea', 'apac', 'nam'
     * @param downloadFolder folder where files will be downloaded to
     */
    constructor(clientId, clientSecret, region, downloadFolder) {
        this._clientId = clientId;
        this._clientSecret = clientSecret;
        this._downloadFolder = downloadFolder;
        this._icsClient = axios.create({baseURL: `https://${region}.api.newvoicemedia.com/interaction-content`});
        this._oidcClient = axios.create({baseURL: `https://${region}.newvoicemedia.com/Auth`});
    }

    /***
     * Search for interactions
     * @param start ISO8601 date to search interactions from
     * @param end ISO8601 date to search interactions to
     * @param page Page number starting from 1
     * @returns {PromiseLike<T | void>}
     */
    search(start, end, page = 1) {
        return this._authenticate()
            .then(token => this._icsClient.get('/interactions', {
                params: {
                    start, end, page,
                    limit: 2
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.newvoicemedia.v2+json',
                    'x-nvm-application': 'node-sample'
                }
            }))
            .then(r => r.data, e => console.error('Search failed', e.message, e.response.statusText))
    }

    /**
     * Download specific content of an interaction
     * @param interactionId GUID of an interaction
     * @param contentKey Unique name of content within interaction
     * @returns {PromiseLike<T | void>}
     */
    downloadContent(interactionId, contentKey) {
        const contentUrl = `/interactions/${interactionId}/content/${contentKey}`;
        return this._authenticate().then(
            token => this._icsClient.request({
                responseType: 'arraybuffer',
                url: `${contentUrl}`,
                method: 'get',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.newvoicemedia.v2+json'
                }
            })
        ).then(
            r => {
                console.log(`Content ${contentKey} can be downloaded for ${interactionId}`);
                this._saveToDisk(r, interactionId, contentKey);
            },
            e => console.error(`Content ${contentKey} couldn't be downloaded for ${interactionId} - ${contentUrl}`, e.response.status)
        )
    }

    _downloadPage(items) {
        items.forEach(i => this._downloadAllContent(i.guid, i.content));
    }

    _authenticate() {
        return this._oidcClient.post('/connect/token',
            qs.stringify({
                grant_type: 'client_credentials',
                scope: 'interaction-content:read'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                auth: {
                    username: this._clientId,
                    password: this._clientSecret
                }
            })
            .then(r => r.data.access_token, e => console.error('Authentication failed', e));
    }

    _downloadAllContent(interactionId, contentList) {
        return contentList.map(c => this.downloadContent(interactionId, c.contentKey));
    }

    _saveToDisk(response, interactionId, contentKey) {
        fs.writeFileSync(
            `${this._downloadFolder}/${interactionId}_${contentKey}${this._determineExtension(response.headers)}`,
            response.data
        );
    }

    _determineExtension(headers) {
        const contentType = headers['content-type'];
        if (!contentType) {
            return '';
        }
        if (contentType.includes('wav')) {
            return '.wav';
        }
        if (contentType.includes('json')) {
            return '.json';
        }
        if (contentType.includes('webm')) {
            return '.webm';
        }
        return '';
    }
}

module.exports = IcsClient;