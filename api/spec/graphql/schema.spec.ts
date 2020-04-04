import { buildSchema } from 'graphql';

describe('graphql', () => {
  it('parses the schema', (done: () => void) => {
    const schema = buildSchema(`
      scalar fluffy
      type Cat {
        name: Boolean
      }
    `)

    console.log(schema);
    done()
  });
});
