import test from 'ava';
import {getBase64UrlHash} from './getBase64UrlHash';

test('get a hash string', (t) => {
    const hash = getBase64UrlHash('foo', Buffer.from('bar'));
    t.is(hash, 'w6uP8Tcg6K2QR905Rms8iXTlksL6OD1KOWBxTK7wxPI');
});
