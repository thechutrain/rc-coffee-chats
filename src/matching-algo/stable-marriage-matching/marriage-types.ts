export type marriage_id = any;

export type Acceptor<T> = {
  data: T;
  marriage_id;
  priority: marriage_id[];
  topSuitor: marriage_id | null;
};

export type Suitor<T> = {
  data: T;
  marriage_id;
  priority: marriage_id[];
  currentlyAccepted: boolean;
};
