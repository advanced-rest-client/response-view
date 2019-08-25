import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import '../response-view.js';

describe('<response-view>', function() {
  async function getFixture() {
    const request = {
      url: 'https://domain.com',
      method: 'GET',
      headers: 'accept: application/json'
    };
    return (await fixture(html`<response-view
      isxhr
      .request="${request}"></response-view>`));
  }

  async function headFixture() {
    const request = {
      url: 'https://domain.com',
      method: 'HEAD',
      headers: 'accept: application/json'
    };
    return (await fixture(html`<response-view
      isxhr
      .request="${request}"></response-view>`));
  }

  describe('Request computations', () => {
    let element;
    beforeEach(async () => {
      element = await getFixture();
    });

    it('Sets requestUrl', () => {
      assert.equal(element.requestUrl, 'https://domain.com');
    });

    it('Sets requestMethod', () => {
      assert.equal(element.requestMethod, 'GET');
    });

    it('Sets requestMethod', () => {
      assert.equal(element.requestHeaders, 'accept: application/json');
    });

    it('Computes _hasResponse', () => {
      assert.isTrue(element._hasResponse);
    });
  });

  describe('HEAD request', () => {
    let element;
    beforeEach(async () => {
      element = await headFixture();
    });

    it('_hasResponse is false', () => {
      assert.isFalse(element._hasResponse);
    });

    it('Renders empty info', () => {
      const label = element.shadowRoot.querySelector('.empty-info');
      assert.ok(label);
    });
  });

  describe('Response computations', () => {
    async function suiteFixture() {
      const request = {
        url: 'https://domain.com',
        method: 'GET',
        headers: 'accept: application/json'
      };
      const response = {
        status: 200,
        statusText: 'OK',
        payload: '{"test":true}',
        headers: 'content-type: application/json; charset=utf8'
      };
      return (await fixture(html`<response-view
        isxhr
        .request="${request}"
        .response="${response}"></response-view>`));
    }

    let element;
    beforeEach(async () => {
      element = await suiteFixture();
    });

    it('Sets contentType', () => {
      assert.equal(element.contentType, 'application/json');
    });

    it('Empty info is not rendered', () => {
      const label = element.shadowRoot.querySelector('.empty-info');
      assert.notOk(label);
    });

    it('Renders response-body-view', () => {
      const panel = element.shadowRoot.querySelector('response-body-view');
      assert.ok(panel);
    });
  });

  describe('Error response', () => {
    async function suiteFixture() {
      const request = {
        url: 'https://domain.com',
        method: 'GET',
        headers: 'accept: application/json'
      };

      const response = {
        status: 200,
        statusText: 'OK',
        // payload: '{"test":true}',
        headers: 'content-type: application/json; charset=utf8'
      };

      const responseError = new Error('test');
      return (await fixture(html`<response-view
        isxhr iserror
        .request="${request}"
        .response="${response}"
        .responseError="${responseError}"></response-view>`));
    }

    let element;
    beforeEach(async () => {
      element = await suiteFixture();
    });

    it('Sets contentType', () => {
      assert.equal(element.contentType, 'application/json');
    });

    it('renders response-error-view when no payload', () => {
      const label = element.shadowRoot.querySelector('response-error-view');
      assert.ok(label);
    });

    it('renders response-body-view when payload is set', async () => {
      const r = element.response;
      r.payload = '{"test":true}';
      element.response = Object.assign({}, r);
      await nextFrame();
      const panel = element.shadowRoot.querySelector('response-body-view');
      assert.ok(panel);
    });
  });


  describe('Advanced data', () => {
    async function suiteFixture() {
      const request = {
        url: 'https://domain.com/',
        method: 'GET',
        headers: 'accept: text/plain'
      };

      let headers = 'content-type: text/plain\nlocation: ';
      headers += 'https://other.domain.com\ncontent-length: 30';

      const response = {
        status: 200,
        statusText: 'OK',
        payload: 'Hello world',
        headers: 'content-type: text/plain'
      };

      const redirects = [{
        status: 301,
        statusText: 'Not here',
        payload: 'Go to https://other.domain.com',
        headers: headers
      }];

      const timings = {
        blocked: 12.0547856,
        dns: 0.12,
        connect: 112.21458762,
        send: 4.4748989,
        wait: 15.8436988,
        receive: 65.125412256,
        ssl: 10
      };

      const redirectTimings = [{
        blocked: 12.0547856,
        dns: 0.12,
        connect: 112.21458762,
        send: 4.4748989,
        wait: 15.8436988,
        receive: 65.125412256,
        ssl: 10
      }];

      return (await fixture(html`<response-view
        .loadingTime="124.12345678"
        .sentHttpMessage="GET / HTTP/1.1\nHost: domain.com\naccept: text/plain\n\n\n"
        .request="${request}"
        .response="${response}"
        .redirects="${redirects}"
        .redirectTimings="${redirectTimings}"
        .responseTimings="${timings}"></response-view>`));
    }

    let element;
    beforeEach(async () => {
      element = await suiteFixture();
    });

    it('response-status-view is rendered', () => {
      const panel = element.shadowRoot.querySelector('response-status-view');
      assert.ok(panel);
    });

    it('_hasResponse is true', () => {
      assert.isTrue(element._hasResponse);
    });
  });
});
