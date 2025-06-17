// Sanity-Studio/schemaTypes/size.schema.ts
import {Rule} from '@sanity/types'

export default {
  name: 'size',
  title: 'Size',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Size Name',
      type: 'string',
      description: 'E.g., "Small", "Medium", "Large", "XL", "One Size"',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'abbreviation',
      title: 'Abbreviation',
      type: 'string',
      description: 'E.g., "S", "M", "L", "XL", "OS"',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'abbreviation',
    }
  }
}
