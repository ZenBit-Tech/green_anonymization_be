import { Injectable } from '@nestjs/common';

type GenerateSyntheticDataInput = {
  documentId: string;
  count: number;
};

@Injectable()
export default class SyntheticDataService {
  // eslint-disable-next-line class-methods-use-this
  async generate(input: GenerateSyntheticDataInput) {
    const syntheticDocuments = Array.from(
      { length: input.count },
      (_, index) => ({
        id: `synthetic-${index + 1}`,
        entities: [
          {
            entity_type: 'PERSON',
            value: `John Doe ${index + 1}`,
          },
          {
            entity_type: 'EMAIL',
            value: `user${index + 1}@mail.com`,
          },
          {
            entity_type: 'PHONE',
            value: `+1-555-000-${index + 1}`,
          },
        ],
      }),
    );

    return { syntheticDocuments };
  }
}
