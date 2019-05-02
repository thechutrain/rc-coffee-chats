// import { } from './index';

xdescribe('rc utility function', () => {
  it('should be able to get start dates', async () => {
    // expect(false).toBe(true);
    const { starting_batches, ending_batches } = await getStartingEndingBatches(
      '2019-04-01'
    );

    expect(starting_batches.length).toBe(2);
  });

  it('should be able to get ending dates', async () => {
    // expect(false).toBe(true);
    const { starting_batches, ending_batches } = await getStartingEndingBatches(
      '2019-06-27'
    );
    expect(starting_batches.length).toBe(0);
    expect(ending_batches.length).toBe(1);
  });
});
