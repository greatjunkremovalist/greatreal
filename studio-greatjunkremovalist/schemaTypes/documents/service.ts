import {CaseIcon} from '@sanity/icons/Case'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortTitle',
      type: 'string',
    }),
    defineField({
      name: 'navLabel',
      title: 'Nav label',
      type: 'string',
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'heroIntro',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'quoteServiceValue',
      title: 'Quote form value',
      type: 'string',
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'overview',
      type: 'array',
      of: [defineArrayMember({type: 'text'})],
    }),
    defineField({
      name: 'includes',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'benefits',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string'}),
            defineField({name: 'text', type: 'text', rows: 2}),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
    }),
    defineField({
      name: 'process',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'step', type: 'string'}),
            defineField({name: 'text', type: 'text', rows: 2}),
          ],
          preview: {select: {title: 'step'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'shortTitle', media: 'image'},
  },
})
