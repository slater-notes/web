import { getKeyFromDerivedPassword, exportKey, stringToBuffer } from '@slater-notes/core';
import axios from 'axios';
import { defaultCloudSyncURL } from '../config/cloudSync';
import { addPolyfill } from '../utils/testPolyfill';
import getAccountFromCloudSync from '../api/cloudSync/getAccount';
import getNewSessionFromCloudSync from '../api/cloudSync/getNewSession';
import registerToCloudSync from '../api/cloudSync/registerAccount';
import updateAccountToCloudSync from '../api/cloudSync/updateAccount';
import putNoteToCloudSync from '../api/cloudSync/putNote';
import getNoteFromCloudSync from '../api/cloudSync/getNote';
import deleteNoteFromCloudSync from '../api/cloudSync/deleteNote';

addPolyfill();

describe('Cloud sync', () => {
  const username = 'registertestuser';
  let token: any;
  let sessionToken: any;

  beforeAll(() => {
    return (async () => {
      const passwordKey = await getKeyFromDerivedPassword(
        'abc123',
        stringToBuffer(username),
        true,
        1,
        true,
      );

      token = await exportKey(passwordKey);
    })();
  });

  afterAll(() => {
    return (async () => {
      if (sessionToken) {
        await axios.delete(`${defaultCloudSyncURL}/account`, {
          data: {
            username,
            sessionToken,
          },
        });
      }
    })();
  });

  test('register account', async (done) => {
    const result = await registerToCloudSync({
      username,
      token,
      userItem: 'aaa',
      fileCollection: 'bbb',
    });

    if ('error' in result) throw Error();

    expect(result.sessionToken).toBeTruthy();
  });

  test('get new session', async () => {
    const result = await getNewSessionFromCloudSync({
      username,
      token,
    });

    if ('error' in result) throw Error();

    expect(result.sessionToken).toBeTruthy();

    sessionToken = result.sessionToken;
  });

  test('get account', async () => {
    const result = await getAccountFromCloudSync({
      username,
      sessionToken,
    });

    if ('error' in result) throw Error();

    expect(result.userItem).toBeTruthy();
    expect(result.fileCollection).toBeTruthy();
  });

  test('update account', async () => {
    const result = await updateAccountToCloudSync({
      username,
      sessionToken,
      userItem: 'aaa1',
      fileCollection: 'bbb1',
    });

    expect('success' in result).toBeTruthy();
  });

  test('put note', async () => {
    const result = await putNoteToCloudSync({
      username,
      sessionToken,
      noteId: 'abc123',
      noteData: 'aaabbb',
    });

    if ('error' in result) throw Error();

    expect('success' in result).toBeTruthy();
  });

  test('get note', async () => {
    const result = await getNoteFromCloudSync({
      username,
      sessionToken,
      noteId: 'abc123',
    });

    if ('error' in result) throw Error();

    expect(result.noteData).toBeTruthy();
  });

  test('delete note', async () => {
    const result = await deleteNoteFromCloudSync({
      username,
      sessionToken,
      noteId: 'abc123',
    });

    expect('success' in result).toBeTruthy();
  });
});
