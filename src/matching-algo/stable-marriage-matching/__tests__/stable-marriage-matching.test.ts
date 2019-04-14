import {
  Acceptor,
  Suitor,
  makeStableMarriageMatches,
  trimAfterRank
} from '../stable-marriage-algo';

interface IBasicUser {
  email: string;
  full_name: string;
  prevMatches: IBasicUser[];
}

interface IUnique {
  _id: number;
}

type IUser = IBasicUser & IUnique;

const male_1: IUser = {
  _id: 1,
  email: 'male_1',
  full_name: 'male 1',
  prevMatches: []
};

const male_2: IUser = {
  _id: 2,
  email: 'male_2',
  full_name: 'male 2',
  prevMatches: []
};

const male_3: IUser = {
  _id: 3,
  email: 'male_3',
  full_name: 'male 3',
  prevMatches: []
};

const female_1: IUser = {
  _id: 4,
  email: 'female_1',
  full_name: 'female 1',
  prevMatches: []
};

const female_2: IUser = {
  _id: 5,
  email: 'female_2',
  full_name: 'female 2',
  prevMatches: []
};

const female_3: IUser = {
  _id: 6,
  email: 'female_3',
  full_name: 'female 3',
  prevMatches: []
};

describe('Stable Marriage utility functions:', () => {
  it('trimAfterRank should work', () => {
    const priorityList = [0, 1, 2, 3, 4, 5];
    trimAfterRank(priorityList, 1);
    expect(priorityList.length).toBe(2);
  });
});

describe('Stable Marriage Match Algo:', () => {
  it('should throw an error if suitors and acceptors are different sizes', () => {
    const suitor1: Suitor<IUser> = {
      self: male_1,
      priority: [],
      currentlyAccepted: false
    };
    const suitor2: Suitor<IUser> = {
      self: male_2,
      priority: [],
      currentlyAccepted: false
    };
    const acceptor: Acceptor<IUser> = {
      self: female_2,
      priority: [],
      topSuitor: null
    };

    const suitors: Map<string, Suitor<IUser>> = new Map();
    suitors.set(male_1.email, suitor1);
    suitors.set(male_2.email, suitor2);
    const acceptors: Map<string, Acceptor<IUser>> = new Map();
    acceptors.set(female_2.email, acceptor);

    let error = null;
    try {
      const matches = makeStableMarriageMatches(suitors, acceptors);
      console.log(matches);
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
  });

  it('should find stable match in a pool of four users', () => {
    const suitor1: Suitor<IUser> = {
      self: male_1,
      priority: [female_1, female_2],
      currentlyAccepted: false
    };
    const suitor2: Suitor<IUser> = {
      self: male_2,
      priority: [female_1, female_2],
      currentlyAccepted: false
    };
    const acceptor1: Acceptor<IUser> = {
      self: female_1,
      priority: [male_1, male_2],
      topSuitor: null
    };
    const acceptor2: Acceptor<IUser> = {
      self: female_2,
      priority: [male_1, male_2],
      topSuitor: null
    };

    const suitors: Map<string, Suitor<IUser>> = new Map();
    suitors.set(male_1.email, suitor1);
    suitors.set(male_2.email, suitor2);
    const acceptors: Map<string, Acceptor<IUser>> = new Map();
    acceptors.set(female_1.email, acceptor1);
    acceptors.set(female_2.email, acceptor2);

    const matches = makeStableMarriageMatches(suitors, acceptors);
    console.log('🐝', matches);
    expect(matches.length).toBe(2);
    // TODO: check internal matches
    // let expectedMatch1[male_1, female_1]
  });
});
