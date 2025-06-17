// Sanity-Studio/schemaTypes/product.schema.ts
import {Rule} from '@sanity/types'

export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule: Rule) => Rule.required().error('Product name is required.'),
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
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{type: 'block'}, {type: 'image'}], // Basic rich text with images
      validation: (Rule: Rule) => Rule.required().error('Description is required.'),
    },
    {
      name: 'excerpt',
      title: 'Excerpt / Short Summary',
      type: 'text',
      rows: 3,
      validation: (Rule: Rule) => Rule.max(200).error('Excerpt should be 200 characters or less.'),
    },
    {
      name: 'sku',
      title: 'SKU (Main Product)',
      type: 'string',
      description: 'Stock Keeping Unit for the main product if not using variants, or a base SKU.',
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule: Rule) => Rule.required().precision(2).min(0).error('Price is required and must be a positive number.'),
    },
    {
      name: 'salePrice',
      title: 'Sale Price',
      type: 'number',
      description: 'Optional: If set, this will be the displayed price.',
      validation: (Rule: Rule) => Rule.precision(2).min(0).error('Sale price must be a positive number.'),
    },
    {
      name: 'isFeatured',
      title: 'Featured Product',
      type: 'boolean',
      description: 'Mark as true to feature this product (e.g., on the homepage).',
      initialValue: false,
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: (Rule: Rule) => Rule.required().error('Alt text for main image is required.'),
        },
      ],
      validation: (Rule: Rule) => Rule.required().error('Main image is required.'),
    },
    {
      name: 'additionalImages',
      title: 'Additional Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              validation: (Rule: Rule) => Rule.required().error('Alt text for additional image is required.'),
            },
          ],
        },
      ],
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      validation: (Rule: Rule) => Rule.required().min(1).error('At least one category is required.'),
    },
    {
      name: 'subcategories',
      title: 'Subcategories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'subcategory'}]}],
      description: 'Optional: Further classify the product.',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Draft', value: 'draft'},
          {title: 'Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'stockQuantity',
      title: 'Stock Quantity (Main Product)',
      type: 'number',
      description: 'Inventory for the main product if not using variants. For variants, manage stock in the variant details.',
      validation: (Rule: Rule) => Rule.integer().min(0).error('Stock must be a non-negative integer.'),
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
    },
    {
      name: 'tags',
      title: 'Tags/Keywords',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    },
    {
      name: 'variants',
      title: 'Product Variants',
      type: 'array',
      description: 'Define different versions of the product (e.g., by color, size). If variants are added, their details (price, SKU, stock) will override main product settings.',
      of: [
        {
          type: 'object',
          title: 'Variant',
          fields: [
            {
              name: 'name',
              title: 'Variant Name',
              type: 'string',
              description: 'E.g., "Blue / Large" or "Red Option". This will be shown to customers.',
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: 'sku',
              title: 'Variant SKU',
              type: 'string',
            },
            {
              name: 'price',
              title: 'Variant Price',
              type: 'number',
              description: 'Overrides main product price. Leave blank to use main product price.',
              validation: (Rule: Rule) => Rule.precision(2).min(0),
            },
            {
              name: 'salePrice',
              title: 'Variant Sale Price',
              type: 'number',
              description: 'Overrides main product sale price and variant price if set.',
              validation: (Rule: Rule) => Rule.precision(2).min(0),
            },
            {
              name: 'stockQuantity',
              title: 'Variant Stock Quantity',
              type: 'number',
              validation: (Rule: Rule) => Rule.required().integer().min(0).error('Stock quantity is required and must be a non-negative integer.'),
              initialValue: 0,
            },
            {
              name: 'image',
              title: 'Variant Image',
              type: 'image',
              options: {hotspot: true},
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alternative text',
                  validation: (Rule: Rule) => Rule.required().error('Alt text for variant image is required.'),
                },
              ],
            },
            {
              name: 'color',
              title: 'Color',
              type: 'string',
              description: 'E.g., "Blue", "Red", "Green". Consider using a reference to a global Color schema if colors need to be managed centrally.',
            },
            {
              name: 'size',
              title: 'Size',
              type: 'string',
              description: 'E.g., "S", "M", "L", "XL". Consider using a reference to a global Size schema for consistency.',
            },
            {
              name: 'weight',
              title: 'Weight (kg)',
              type: 'number',
              validation: (Rule: Rule) => Rule.min(0),
            },
            {
              name: 'dimensions',
              title: 'Dimensions (cm)',
              type: 'object',
              fields: [
                {name: 'length', type: 'number', title: 'Length (cm)', validation: (Rule: Rule) => Rule.min(0)},
                {name: 'width', type: 'number', title: 'Width (cm)', validation: (Rule: Rule) => Rule.min(0)},
                {name: 'height', type: 'number', title: 'Height (cm)', validation: (Rule: Rule) => Rule.min(0)},
              ],
            },
          ],
          preview: {
            select: {
              title: 'name',
              color: 'color',
              size: 'size',
              stock: 'stockQuantity',
              media: 'image',
            },
            prepare(selection: any) {
              const {title, color, size, stock, media} = selection;
              let subtitle = `${color || ''}${color && size ? ' / ' : ''}${size || ''}`;
              subtitle = subtitle ? `${subtitle} - Stock: ${stock !== undefined ? stock : 'N/A'}` : `Stock: ${stock !== undefined ? stock : 'N/A'}`;
              return {
                title: title || 'Unnamed Variant',
                subtitle: subtitle,
                media: media,
              };
            },
          },
        },
      ],
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
          validation: (Rule: Rule) => Rule.max(70).error('SEO Title should be 70 characters or less.'),
        },
        {
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          rows: 3,
          validation: (Rule: Rule) => Rule.max(160).error('SEO Description should be 160 characters or less.'),
        },
        {
            name: 'og_image',
            title: 'OG Image',
            type: 'image',
        }
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    },
  ],
  preview: {
    select: {
      title: 'name',
      category0: 'categories.0.name',
      media: 'mainImage',
      status: 'status',
      isFeatured: 'isFeatured'
    },
    prepare(selection: any) {
      const {title, category0, media, status, isFeatured} = selection
      return {
        title: title,
        subtitle: `${status ? status.charAt(0).toUpperCase() + status.slice(1) : ''}${category0 ? ' in ' + category0 : ''}${isFeatured ? ' ✨ Featured' : ''}`,
        media: media,
      }
    },
  },
}
