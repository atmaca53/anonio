// @flow

import getANONPrice from '../../services/anon-price';

describe('ANON PRICE Services', () => {
  test('should return the right value', async () => {
    const response = await getANONPrice(['BRL', 'EUR', 'USD']);

    expect(response).toEqual({
      USD: expect.any(Number),
      BRL: expect.any(Number),
      EUR: expect.any(Number),
    });
  });
});
