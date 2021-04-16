// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, MusicTaste } = initSchema(schema);

export {
  User,
  MusicTaste
};