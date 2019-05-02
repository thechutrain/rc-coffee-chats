import { getNewCurrentBatches } from './index';

describe('rc utility function', () => {
  it('should be able to get batches that started today', async () => {
    // expect(false).toBe(true);
    const { newBatches, currentBatches } = await getNewCurrentBatches(
      '2019-04-01'
    );

    expect(newBatches.length).toBe(2);
  });

  it('should not get any batches did not start today', async () => {
    // expect(false).toBe(true);
    const { newBatches, currentBatches } = await getNewCurrentBatches(
      '2019-04-02'
    );

    expect(newBatches.length).toBe(0);
  });

  it('should be able to get batches that are insession', async () => {
    // expect(false).toBe(true);
    const { newBatches, currentBatches } = await getNewCurrentBatches(
      '2019-04-02'
    );
    expect(newBatches.length).toBe(0);
    expect(currentBatches.length).toBe(3);
  });

  it('should include batches that are ending on given day', async () => {
    const { newBatches, currentBatches } = await getNewCurrentBatches(
      '2019-03-28'
    );

    expect(newBatches.length).toBe(0);
    expect(currentBatches.length).toBe(2);
  });
});
