import { parseIntent } from '../lib/ai';

test('parseIntent -> SHOW_COLLECTION for luxury', async () => {
  const mock = { top: { label: 'SHOW_COLLECTION', confidence: 0.92, args: { collection: 'luxury' } } };
  // @ts-ignore
  global.fetch = jest.fn().mockResolvedValue({ json: async () => mock });
  const res = await parseIntent('I feel luxurious today');
  expect(res.top.label).toBe('SHOW_COLLECTION');
  expect(res.top.args.collection).toBe('luxury');
});