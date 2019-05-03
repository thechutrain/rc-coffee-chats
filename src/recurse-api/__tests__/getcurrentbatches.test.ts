import { getCurrentBatches } from '../index';

describe('getCurrentBatches', () => {
  xit('should be able to get all batches for today', async () => {
    const currentBatches = await getCurrentBatches();
  });

  it('should be able to get all batches from start date', async () => {
    const currentBatches = await getCurrentBatches('2019-04-01');
    expect(currentBatches.length).toBe(3);
  });

  it('should be able to get all batches from during a date range', async () => {
    const currentBatches = await getCurrentBatches('2019-05-02');
    expect(currentBatches.length).toBe(2);
  });

  it('should be able to get all batches from start date', async () => {
    const currentBatches = await getCurrentBatches('2019-05-09');
    expect(currentBatches.length).toBe(2);
  });
});
