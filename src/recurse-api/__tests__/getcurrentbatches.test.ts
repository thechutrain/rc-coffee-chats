import { getCurrentBatches, isMiniBatch } from '../index';
import { getSixWeekEndDate } from '../getcurrentbatches';

const mockSpringBatch = {
  id: 58,
  name: 'Spring 1, 2019',
  start_date: '2019-02-18',
  end_date: '2019-05-09'
};

const mockMiniBatch = {
  id: 63,
  name: 'Mini 3, 2019',
  start_date: '2019-04-01',
  end_date: '2019-04-05'
};

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

describe('isMiniBatch(): ', () => {
  it('should be able to determine that its a mini batch', () => {
    const isMini = isMiniBatch(mockMiniBatch);
    expect(isMini).toBe(true);
  });

  it('should be able to determine that its NOT mini batch', () => {
    const isMini = isMiniBatch(mockSpringBatch);
    expect(isMini).toBe(false);
  });
});

describe('getSixWeekEndDate(): ', () => {
  it('should work', () => {
    const sixWeekDate = getSixWeekEndDate(mockSpringBatch);
    expect(sixWeekDate).toBe('2019-03-28');
  });
});
