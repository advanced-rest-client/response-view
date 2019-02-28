/**
@license
Copyright 2016 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@advanced-rest-client/response-status-view/response-status-view.js';
import '@advanced-rest-client/response-error-view/response-error-view.js';
import '@advanced-rest-client/response-body-view/response-body-view.js';
/**
 * An element to display HTTP response view.
 *
 * It accepts request data object to render additional information in the
 * status bar (method & URL).
 *
 * ## Data model
 *
 * ## Request data model
 *
 * The request is ARC (Advanced REST client) request data model. It expects
 * the following properties:
 * - url (`String`) - Request URL
 * - method (`String`) - Request HTTP method.
 * - headers (`String|undefined`) - HTTP headers string
 * - payload (`String|FormData|File|ArrayBuffer|undefined`) Request body
 *
 * ## Response data model
 *
 * The response is ARC response data model:
 * - status (`Number`) - Response status code
 * - statusText (`String`) - Response status text. Can be empty string.
 * - payload (`String|Document|ArrayBuffer|Blob|undefined`) - Response body
 * - headers (`String|undefined`) - Response headers
 *
 * Response object is created by `advanced-rest-client/xhr-simple-request`.
 * However, any transport library can generate similar object.
 *
 * ## Advanced transport properties
 *
 * When using own transport libraries or server side transport you may have
 * access to more information about the request and response like redirects
 * and timings. The response status view can render additional UI for this
 * data.
 * To enable this feature, set `isXhr` to false and any of the following
 * properties:
 *
 * - sentHttpMessage `String` - Raw HTTP message sent to server
 * - redirects `Array<Object>` - A list of redirect information. Each object has
 * the following properties:
 *  - status (`Number`) - Response status code
 *  - statusText (`String`) - Response status text. Can be empty string.
 *  - headers (`String|undefined`) - Response headers
 *  - payload (`String|Document|ArrayBuffer|Blob|undefined`) - Response body
 * - redirectTimings `Array<Object>` - List of HAR 1.2 timing objects for
 * each redirected request. The order must corresponds with order in `redirects`
 * array.
 * - timings `Object` - HAR 1.2 timings object
 *
 * Read [response-status-view]
 * (https://elements.advancedrestclient.com/elements/response-status-view)
 * element documentation for more details.
 *
 * ## Error reporting
 *
 * If there's a request error set `isError` property and the `responseError`
 * that is an `Error` object.
 *
 * ## Changes in version 2.0
 * - API components does not uses `Reques` and `Response` objects anymore.
 * Instead use data model described above.
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--response-view` | Mixin applied to the element | `{}`
 * `--no-info-message` | Mixin applied to the information about lack of the response | `{}`
 *
 * Use: `response-status-view`, `response-body-view` and `response-error-view`
 * styles to style this element.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof ApiElements
 */
class ResponseView extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      @apply --response-view;
    }

    .empty-info {
      @apply --no-info-message;
    }
    </style>
    <response-status-view status-code="[[statusCode]]" status-message="[[statusMessage]]" request-headers="[[requestHeaders]]" response-headers="[[responseHeaders]]" loading-time="[[loadingTime]]" http-message="[[sentHttpMessage]]" redirects="[[redirects]]" redirect-timings="[[redirectTimings]]" timings="[[responseTimings]]" is-xhr="[[isXhr]]" request-url="[[requestUrl]]" request-method="[[requestMethod]]"></response-status-view>
    <template is="dom-if" if="[[hasResponse]]">
      <template is="dom-if" if="[[_renderError]]">
        <response-error-view message="[[responseError.message]]"></response-error-view>
      </template>
      <template is="dom-if" if="[[hasResponseBody]]">
        <response-body-view response-text="[[responseBody]]" content-type="[[contentType]]"></response-body-view>
      </template>
    </template>
    <template is="dom-if" if="[[!hasResponse]]">
      <p class="empty-info">This response does not carry a payload.</p>
    </template>
`;
  }

  static get is() {
    return 'response-view';
  }
  static get properties() {
    return {
      /**
       * ARC response object.
       *
       * Properties -
       * - status (`Number`) - Response status code
       * - statusText (`String`) - Response status text. Can be empty string.
       * - headers (`String|undefined`) - Response headers
       * - payload (`String|Document|ArrayBuffer|Blob|undefined`) - Response body
       *
       * @type {{
       *  status: String,
       *  statusText: String,
       *  headers: (String|undefined),
       *  payload: (String|Document|ArrayBuffer|Blob|undefined)}}
       */
      response: {
        type: Object,
        observer: '_responseChanged'
      },
      /**
       * ARC request object
       *
       * Properties -
       * - url (`String`) - Request URL
       * - method (`String`) - Request HTTP method.
       * - headers (`String|undefined`) - HTTP headers string
       * - payload (`String|FormData|File|ArrayBuffer|undefined`) Request body
       *
       * @type {{
       *  url: String.
       *  method: String,
       *  headers: (String|undefined),
       *  payload: (String|FormData|File|ArrayBuffer|undefined)
       * }}
       */
      request: {
        type: Object,
        observer: '_requestChanged'
      },
      /**
       * An Error object associated with the request if the response was errored.
       * It should have a `message` property set to the human readable
       * explenation of the error.
       * If not set the default message will be displaed.
       *
       * `isError` must be set with thit object.
       *
       * @type {Error}
       */
      responseError: Object,
      /**
       * Response body.
       *
       * Ths value is computed from `response` property.
       *
       * @type {String|FormData|File|ArrayBuffer|undefined}
       */
      responseBody: String,
      /**
       * Returned status code.
       * Ths value is computed from `response` property.
       */
      statusCode: Number,
      /**
       * Returned status message (if any).
       * Ths value is computed from `response` property.
       */
      statusMessage: String,
      /**
       * Request headers sent to the server.
       * Ths value is computed from `request` property.
       */
      requestHeaders: String,
      /**
       * Returned from the server headers.
       * Ths value is computed from `response` property.
       */
      responseHeaders: String,
      /**
       * The response content type header if present
       * Ths value is computed from `response` property.
       */
      contentType: String,
      /**
       * If available, the request / response timings as defined in HAR 1.2
       * spec.
       */
      responseTimings: Object,
      /**
       * The total time of the request / response load.
       */
      loadingTime: Number,
      /**
       * If this information available, the source HTTP message sent to
       * the remote machine.
       */
      sentHttpMessage: String,
      /**
       * List of ordered redirects.
       * Each object has the following properties:
       * - status (`Number`) - Response status code
       * - statusText (`String`) - Response status text. Can be empty string.
       * - headers (`String|undefined`) - Response headers
       * - payload (`String|Document|ArrayBuffer|Blob|undefined`) - Response body
       */
      redirects: Array,
      /**
       * If timings stats are available for redirects, the list of the
       * `timings` objects as defined in HAR 1.2 specification.
       * The list should be ordered list.
       */
      redirectTimings: Array,
      /**
       * Computed value, false if the response is set and it is a HEAD type
       * request (which can't have the response).
       */
      hasResponse: {
        type: Boolean,
        value: true,
        computed: '_computeHasResponse(request)'
      },
      /**
       * Computed value, true when the response body has a value.
       */
      hasResponseBody: {
        type: Boolean,
        value: false,
        computed: '_computeHasResponseBody(responseBody)'
      },
      // Set to `true` if the response has error object set.
      isError: {
        type: Boolean,
        value: false
      },
      /**
       * If true it means that the request has been made by the basic
       * transport and advanced details of the request/response like
       * redirects, timings, source message are not available.
       * It this case it will hide unused tabs.
       */
      isXhr: {
        type: Boolean,
        value: false
      },
      // A request URL that has been used to make a request
      requestUrl: String,
      // A HTTP method used to make a request
      requestMethod: String,
      _renderError: {
        type: Boolean,
        computed: '_computeRenderError(isError, hasResponseBody)'
      }
    };
  }

  /**
   * Resets the initial variables for the Response change handler.
   */
  _reset() {
    this.statusCode = undefined;
    this.statusMessage = undefined;
    this.responseHeaders = undefined;
    this.responseBody = undefined;
    this.contentType = undefined;
  }
  /**
   * Propagate response properties when response object changes.
   *
   * @param {Object} response The response object
   */
  _responseChanged(response) {
    this._reset();
    if (!response) {
      return;
    }
    this.statusCode = response.status;
    this.statusMessage = response.statusText;
    this.responseHeaders = response.headers;
    let contentType = this._readContentType(response.headers);
    if (!contentType) {
      contentType = 'text/plain';
    }
    let body = response.payload;
    if (body && body.type === 'Buffer') {
      let str = '';
      for (let i = 0, len = body.data.length; i < len; i++) {
        str += String.fromCharCode(body.data[i]);
      }
      body = str;
    }
    this.responseBody = response.payload;
    this.contentType = contentType;
  }
  /**
   * Reads content-type header from the response headers.
   *
   * @param {?String} headers Headers received from the server
   * @return {String|undefined} Content type value if proesent.
   */
  _readContentType(headers) {
    if (!headers || typeof headers !== 'string') {
      return;
    }
    const ctMatches = headers.match(/^\s*content\-type\s*:\s*(.*)$/im);
    if (!ctMatches) {
      return;
    }
    let mime = ctMatches[1];
    let index = mime.indexOf(';');
    if (index !== -1) {
      mime = mime.substr(0, index);
    }
    return mime;
  }
  /**
   * Propagate request data when the `request` object changes.
   *
   * @param {Object} request The ARC request object
   */
  _requestChanged(request) {
    this.requestHeaders = undefined;
    if (!request) {
      return;
    }
    this.requestUrl = request.url;
    this.requestMethod = request.method;
    this.requestHeaders = request.headers;
  }
  /**
   * Computes if the response panel should be displayed.
   * If the request method is `HEAD` then it never can have response.
   *
   * @param {Object} request ARC request object.
   * @return {Boolean}
   */
  _computeHasResponse(request) {
    if (request && request.method === 'HEAD') {
      return false;
    }
    return true;
  }
  /**
   * Computes value for `hasResponseBody` property.
   *
   * @param {any} body Current response body value.
   * @return {Boolean} True if anything is set.
   */
  _computeHasResponseBody(body) {
    return !!body;
  }

  _computeRenderError(isError, hasResponseBody) {
    return !!(isError && !hasResponseBody);
  }
}
window.customElements.define(ResponseView.is, ResponseView);
