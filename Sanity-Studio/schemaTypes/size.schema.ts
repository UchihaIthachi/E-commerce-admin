import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'size',
  title: 'Size',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) =>
        Rule.required().max(50).error('Name is required and should not exceed 50 characters.'),
    }),
  ],
})
