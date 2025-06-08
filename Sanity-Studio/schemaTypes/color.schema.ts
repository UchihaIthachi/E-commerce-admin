import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'color',
  title: 'Color',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) =>
        Rule.required().max(50).error('Name is required and should not exceed 50 characters.'),
    }),
    defineField({
      name: 'hex',
      title: 'Hex Code',
      type: 'string',
      validation: (Rule) =>
        Rule.required()
          .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/, {
            name: 'hex code',
            invert: false,
          })
          .error('Please enter a valid hex color code (e.g., #FF5733).'),
    }),
  ],
})
