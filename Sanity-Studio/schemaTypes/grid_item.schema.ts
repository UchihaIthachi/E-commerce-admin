// schemas/gridItem.js
export default {
  name: 'grid_item',
  title: 'Grid Item',
  type: 'document',
  fields: [
    {
      name: 'index',
      title: 'Index',
      type: 'number',
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'url', // Assuming image URL is stored as a string
    },
    {
      name: 'link',
      title: 'Link',
      type: 'url', // Storing the link as URL type
    },
  ],
}
