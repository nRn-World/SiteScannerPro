import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import { buildContactMailOptions, ContactController } from '../src/controllers/contact.controller';

function createResponse() {
  const state = { statusCode: 0, body: null as any };
  const expressRes = {
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    json(payload: any) {
      state.body = payload;
      return this;
    }
  };
  return { state, expressRes: expressRes as any };
}

describe('kontaktmail – From och Reply-To', () => {
  it('skickar från det autentiserade kontot och sätter besökaren som Reply-To', () => {
    const mail = buildContactMailOptions(
      {
        name: 'Anna Andersson',
        email: 'anna@example.com',
        subject: 'Fråga om rapporten',
        message: 'Hej, jag undrar över min rapport.'
      },
      {
        EMAIL_USER: 'robot@example.com',
        CONTACT_RECEIVER_EMAIL: 'owner@example.com'
      }
    );

    assert.equal(mail.from, '"SiteScanner Pro" <robot@example.com>');
    assert.equal(mail.replyTo, '"Anna Andersson" <anna@example.com>');
    assert.equal(mail.to, 'owner@example.com');
    assert.ok(!mail.from.includes('anna@example.com'), 'From får inte vara besökarens adress');
  });

  it('sanerar namn och ämne så att SMTP-headers inte kan injiceras', () => {
    const mail = buildContactMailOptions(
      {
        name: 'Eve\r\nBcc: evil@example.com',
        email: 'eve@example.com',
        subject: 'Hej\r\nBcc: evil@example.com',
        message: 'Test'
      },
      { EMAIL_USER: 'robot@example.com' }
    );

    assert.ok(!/[\r\n]/.test(mail.replyTo));
    assert.ok(!/[\r\n]/.test(mail.subject));
    assert.ok(mail.replyTo.includes('Eve Bcc: evil@example.com'));
    assert.ok(mail.subject.includes('Hej Bcc: evil@example.com'));
  });

  it('faller tillbaka på säkra standardvärden när miljön saknar adresser', () => {
    const mail = buildContactMailOptions(
      { name: 'Test', email: 'test@example.com', message: 'Test' },
      {}
    );

    assert.equal(mail.from, '"SiteScanner Pro" <no-reply@localhost>');
    assert.equal(mail.to, 'bynrnworld@gmail.com');
    assert.equal(mail.subject, 'SiteScanner Pro Kontakt: Nytt meddelande');
  });
});

describe('ContactController.sendEmail – nodemailer-mock', () => {
  it('skickar mailet med rätt From och Reply-To', async (t) => {
    const sendMail = mock.fn(async (_options: Record<string, unknown>) => ({ messageId: 'mock-message' }));
    const createTransport = mock.method(
      nodemailer,
      'createTransport',
      (() => ({ sendMail })) as any
    );
    t.after(() => createTransport.mock.restore());

    const previousUser = process.env.EMAIL_USER;
    const previousReceiver = process.env.CONTACT_RECEIVER_EMAIL;
    process.env.EMAIL_USER = 'robot@example.com';
    process.env.CONTACT_RECEIVER_EMAIL = 'owner@example.com';
    t.after(() => {
      if (previousUser === undefined) delete process.env.EMAIL_USER;
      else process.env.EMAIL_USER = previousUser;
      if (previousReceiver === undefined) delete process.env.CONTACT_RECEIVER_EMAIL;
      else process.env.CONTACT_RECEIVER_EMAIL = previousReceiver;
    });

    const controller = new ContactController();
    const { state, expressRes } = createResponse();

    await controller.sendEmail(
      {
        body: {
          name: 'Anna Andersson',
          email: 'anna@example.com',
          subject: 'Hej',
          message: 'Testmeddelande'
        }
      } as any,
      expressRes
    );

    assert.equal(state.statusCode, 200);
    assert.equal(sendMail.mock.callCount(), 1);

    const mail = sendMail.mock.calls[0].arguments[0] as Record<string, any>;
    assert.equal(mail.from, '"SiteScanner Pro" <robot@example.com>');
    assert.equal(mail.replyTo, '"Anna Andersson" <anna@example.com>');
    assert.equal(mail.to, 'owner@example.com');
    assert.ok(!mail.from.includes('anna@example.com'));
  });

  it('skickar inget mail när e-postadressen är ogiltig', async (t) => {
    const createTransport = mock.method(
      nodemailer,
      'createTransport',
      (() => {
        throw new Error('sendEmail must not open SMTP for invalid input');
      }) as any
    );
    t.after(() => createTransport.mock.restore());

    const controller = new ContactController();
    const { state, expressRes } = createResponse();

    await controller.sendEmail(
      { body: { name: 'Test', email: 'a@b', message: 'Test' } } as any,
      expressRes
    );

    assert.equal(state.statusCode, 400);
    assert.equal(createTransport.mock.callCount(), 0);
    assert.equal(state.body.error, 'Ogiltig e-postadress.');
  });
});
