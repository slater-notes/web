import { getKeyFromDerivedPassword, exportKey, stringToBuffer } from '@slater-notes/core';
import axios from 'axios';
import { defaultCloudSyncURL } from '../config/cloudSync';
import { addPolyfill } from '../utils/testPolyfill';
import getAccountFromCloudSync from '../services/cloudSync/api/getAccount';
import getNewSessionFromCloudSync from '../services/cloudSync/api/getNewSession';
import registerToCloudSync from '../services/cloudSync/api/registerAccount';
import updateAccountToCloudSync from '../services/cloudSync/api/updateAccount';
import putNoteToCloudSync from '../services/cloudSync/api/putNote';
import getNoteFromCloudSync from '../services/cloudSync/api/getNote';
import deleteNoteFromCloudSync from '../services/cloudSync/api/deleteNote';

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

  test('register account', async () => {
    const result = await registerToCloudSync({
      username,
      token,
      userItem: 'aaa',
      fileCollection: 'bbb',
    });

    expect(result.sessionToken).toBeTruthy();
  });

  test('get new session', async () => {
    const result = await getNewSessionFromCloudSync({
      username,
      token,
    });

    sessionToken = result.sessionToken;

    expect(result.sessionToken).toBeTruthy();
  });

  test('get account', async () => {
    const result = await getAccountFromCloudSync({
      username,
      sessionToken,
    });

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

    expect(result.success).toBeTruthy();
  });

  test('put note', async () => {
    const result = await putNoteToCloudSync({
      username,
      sessionToken,
      noteId: 'abc123',
      noteData: 'aaabbb',
    });

    expect(result.success).toBeTruthy();
  });

  test('get note', async () => {
    const result = await getNoteFromCloudSync({
      username,
      sessionToken,
      noteId: 'abc123',
    });

    expect(result.noteData).toBeTruthy();
  });

  test('delete note', async () => {
    const result = await deleteNoteFromCloudSync({
      username,
      sessionToken,
      noteId: 'abc123',
    });

    expect(result.success).toBeTruthy();
  });
});