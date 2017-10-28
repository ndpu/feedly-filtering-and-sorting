/// <reference path="../_references.d.ts" />

import { LocalStorage, StorageArea, PromiseStorageArea } from "./LocalStorage";
import { AsyncResult } from "../AsyncResult";
import { injectScriptText, callbackBindedTo } from "../Utils";

export class WebExtLocalStorage implements LocalStorage {
    storage: StorageArea;
    promiseStorage: PromiseStorageArea;
    browser;
    keys: string[] = [];
    isArray = false;
    useSyncStorageId = "USE_SYNC_STORAGE";

    constructor() {
        if (typeof (chrome) != "undefined") {
            this.browser = chrome;
        } else {
            this.browser = browser;
        }
        try {
            this.browser.storage.local;
        } catch (e) {
            this.browser = browser;
        }
    }

    onError = function (e) {
        throw e;
    }

    onSave = function () {
        if (DEBUG) {
            console.log("Storage save success");
        }
    }

    public getAsync<t>(id: string, defaultValue: t): AsyncResult<t> {
        return new AsyncResult<t>((p) => {
            var isArr = this.isArray;
            var callback = (result) => {
                var data = (isArr ? result[0] : result)[id];
                if (data == null) {
                    data = defaultValue;
                }
                p.result(data);
            };
            this.promiseStorage ?
                this.promiseStorage.get(id).then(callback, this.onError) :
                this.storage.get(id, callback);
        }, this);
    }

    public getItemsAsync<t>(ids: string[]): AsyncResult<{ [key: string]: t }> {
        return new AsyncResult<{ [key: string]: t }>((p) => {
            var isArr = this.isArray;
            var callback = (result) => {
                let data = isArr ? result[0] : result;
                p.result(data);
            };
            this.promiseStorage ?
                this.promiseStorage.get(ids).then(callback, this.onError) :
                this.storage.get(ids, callback);
        }, this);
    }

    public put(id: string, value: any) {
        if (this.keys.indexOf(id) == -1) {
            this.keys.push(id);
        }
        var toStore = {};
        toStore[id] = value;
        this.promiseStorage ?
            this.promiseStorage.set(toStore).then(this.onSave, this.onError) :
            this.storage.set(toStore);
    }

    public delete(id: string) {
        var i = this.keys.indexOf(id);
        if (i > -1) {
            this.keys.splice(i, 1);
        }
        this.promiseStorage ?
            this.promiseStorage.remove(id).then(this.onSave, this.onError) :
            this.storage.remove(id);
    }

    public listKeys(): string[] {
        return this.keys;
    }

    private initStorage() {
        return new AsyncResult<any>((p) => {
            var callback = (result) => {
                if ($.isArray(result)) {
                    this.isArray = true;
                }
                var useSyncStorage = (this.isArray ? result[0] : result)[this.useSyncStorageId];
                if (!useSyncStorage) {
                    if (this.promiseStorage) {
                        this.promiseStorage = this.browser.storage.local;
                    } else {
                        this.storage = this.browser.storage.local;
                    }
                }
                p.done();
            };
            try {
                this.promiseStorage = this.browser.storage.sync;
                this.promiseStorage.get(this.useSyncStorageId).then(callback, (e) => {
                    throw e;
                });
            } catch (e) {
                this.promiseStorage = null;
                this.storage = this.browser.storage.sync;
                this.storage.get(this.useSyncStorageId, callback);
            }
        }, this);
    }

    public init(): AsyncResult<any> {
        return new AsyncResult<any>((p) => {
            this.initStorage().then(() => {
                var callback = (result) => {
                    this.keys = this.keys.concat(Object.keys(this.isArray ? result[0] : result));
                    p.done();
                };
                this.promiseStorage ?
                    this.promiseStorage.get(null).then(callback, this.onError) :
                    this.storage.get(null, callback);
            }, this);
        }, this);
    }

    loadScript(name: string) {
        $.ajax({
            url: this.browser.extension.getURL(name),
            dataType: "text",
            async: false,
            success: (result) => {
                injectScriptText(result);
            },
            error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
                console.log(errorThrown);
            }
        });
    }

    public isSyncSupported(): boolean {
        return true;
    }

}

var LocalPersistence = new WebExtLocalStorage();