// @flow

import got from 'got';

type Payload = {
  [currency: string]: number,
};

/**
  WARNING:
  Just a super fast way to get the anon price
*/
// eslint-disable-next-line
export default (currencies: string[] = ['USD']): Promise<Payload> => new Promise((resolve, reject) => {
  const ENDPOINT = `https://min-api.cryptocompare.com/data/price?fsym=ANON&tsyms=${currencies.join(
    ',',
  )}&api_key=${String(process.env.ANON_PRICE_API_KEY)}`;

  got(ENDPOINT)
    .then(response => resolve(JSON.parse(response.body)))
    .catch(reject);
});
