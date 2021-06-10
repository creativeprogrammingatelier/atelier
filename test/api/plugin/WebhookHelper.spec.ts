import {expect} from 'chai';
import crypto from 'crypto';
import 'mocha';

import {WebhookEvent} from '../../../models/enums/WebhookEventEnum';
import {createWebhookRequest} from '../../../api/src/helpers/WebhookHelper';
import {plugin} from './Plugin';

describe('WebhookHelper.createWebhookRequest', () => {
  const event = WebhookEvent.SubmissionFile;
  const body = {
    test: 'value',
    other: {
      thing: 4,
    },
  };

  it('should set the user agent', () => {
    const req = createWebhookRequest(plugin, event, body);
    expect(req.headers.get('User-Agent'), 'User-Agent').to.equal('Atelier');
  });
  it('should create a signed request', async () => {
    const req = createWebhookRequest(plugin, event, body);
    const reqBody = await req.text();
    const signature = crypto.createHmac('sha1', plugin.webhookSecret).update(reqBody).digest('base64');

    expect(req.headers.get('X-Atelier-Signature'), 'X-Atelier-Signature').to.equal(signature);
  });
  it('should set the correct event and payload', async () => {
    const req = createWebhookRequest(plugin, event, body);
    const reqBody = await req.json();

    expect(reqBody.event).to.equal(event);
    expect(reqBody.payload).to.deep.equal(body);
  });
  it('should post to the defined url', () => {
    const req = createWebhookRequest(plugin, event, body);
    expect(req.method).to.equal('POST');
    expect(req.url).to.equal(plugin.webhookUrl);
  });
});

// describe("WebhookHelper.getSubscribedPlugins", () => {
//     const event = plugin.hooks[0];

//     it("should return plugin when it is subscribed", () => {
//         const plugins = getSubscribedPlugins(event);
//         expect(plugins).to.include(plugin);
//     });

//     it("should not return plugin when not subscribed", () => {
//         const plugins = getSubscribedPlugins("nonsubscribedevent");
//         expect(plugins).to.not.include(plugin);
//     });
// });
