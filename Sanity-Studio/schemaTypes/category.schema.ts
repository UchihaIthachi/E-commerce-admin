import {Rule} from '@sanity/types'

export default {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: Rule) => Rule.required().error('Name is required.'),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: Rule) => Rule.required().error('Slug is required.'),
    },
    {
      name: 'seo',
      title: 'SEO Metadata',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'SEO Title',
          type: 'string',
          validation: (Rule: Rule) =>
            Rule.max(60).error('SEO Title should be 60 characters or less.'),
        },
        {
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          validation: (Rule: Rule) =>
            Rule.max(160).error('SEO Description should be 160 characters or less.'),
        },
        {
          name: 'og_title',
          title: 'OG Title',
          type: 'string',
        },
        {
          name: 'og_description',
          title: 'OG Description',
          type: 'string',
        },
        {
          name: 'og_image',
          title: 'OG Image',
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Image URLs',
              type: 'array',
              of: [{type: 'url'}],
              validation: (Rule: Rule) => Rule.optional(), // Optional validation
            },
            {
              name: 'width',
              title: 'Width',
              type: 'number',
              validation: (Rule: Rule) => Rule.min(1).error('Width must be a positive number.'),
            },
            {
              name: 'height',
              title: 'Height',
              type: 'number',
              validation: (Rule: Rule) => Rule.min(1).error('Height must be a positive number.'),
            },
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: (Rule: Rule) =>
                Rule.max(120).error('Alt text should be 120 characters or less.'),
            },
          ],
        },
      ],
    },
  ],
}
