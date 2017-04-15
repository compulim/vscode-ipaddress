'use strict';

const EventEmitter = require('events');
const publicIP     = require('public-ip');

const DEFAULT_OPTIONS = {
  autoRefresh       : true,
  minRefreshInterval: 60000
};

class FreshPublicIP extends EventEmitter {
  constructor(options = DEFAULT_OPTIONS) {
    super();

    this.busy = false;
    this.disposed = false;
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    this.options.autoRefresh && this.refresh();
  }

  dispose() {
    this.disposed = true;
    this._clearSchedule();
  }

  address() {
    return this._promise;
  }

  autoRefresh(enabled) {
    if (enabled) {
      this.options.autoRefresh = true;
      this._schedule();
    } else {
      this.options.autoRefresh = false;
      this._clearSchedule();
    }
  }

  refresh() {
    if (!this.busy) {
      this.busy = true;

      this._promise = publicIP.v4().then(
        address => {
          this.busy = false;
          this.lastRefresh = Date.now();
          this.options.autoRefresh && !this.disposed && this._schedule();

          this.emit('update', address);

          return address;
        },
        err => {
          this.busy = false;
          this.lastRefresh = Date.now();
          this.options.autoRefresh && !this.disposed && this._schedule();

          return Promise.reject(err);
        }
      );
    }

    return this._promise;
  }

  _clearSchedule() {
    clearTimeout(this._scheduled);
  }

  _schedule() {
    const nextRefreshAt = (this.lastRefresh || 0) + this.options.minRefreshInterval;
    const timeToNextRefresh = Math.max(0, nextRefreshAt - Date.now());

    this._clearSchedule();

    this._scheduled = setTimeout(() => {
      this._scheduled = null;
      this.refresh();
    }, timeToNextRefresh);
  }
}

module.exports = options => new FreshPublicIP(options);
