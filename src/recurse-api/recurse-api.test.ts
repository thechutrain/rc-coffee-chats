import { getNewCurrentBatches } from './index';

describe('rc utility function', () => {
  it('should be able to get start dates', async () => {
    // expect(false).toBe(true);
    const { newBatches, currentBatches } = await getNewCurrentBatches(
      '2019-04-01'
    );

    expect(newBatches.length).toBe(2);
  });

  it('should be able to get ending dates', async () => {
    // expect(false).toBe(true);
    const { newBatches, currentBatches } = await getNewCurrentBatches(
      '2019-06-27'
    );
    expect(newBatches.length).toBe(0);
    expect(currentBatches.length).toBe(1);
  });
});
