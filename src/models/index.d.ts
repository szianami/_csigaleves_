import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly refreshToken?: string;
  constructor(init: ModelInit<User>);
  static copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

export declare class MusicTaste {
  readonly id: string;
  readonly username: string;
  readonly artist: string;
  readonly updatedAt: string;
  constructor(init: ModelInit<MusicTaste>);
  static copyOf(source: MusicTaste, mutator: (draft: MutableModel<MusicTaste>) => MutableModel<MusicTaste> | void): MusicTaste;
}