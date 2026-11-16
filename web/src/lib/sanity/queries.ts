import {defineQuery} from 'groq'

export const POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    _id,
    title,
    slug,
    excerpt,
    category,
    publishedAt,
    image
  }`,
)

export const POST_QUERY = defineQuery(
  `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    excerpt,
    category,
    publishedAt,
    image,
    body
  }`,
)

export const FAQS_QUERY = defineQuery(
  `*[_type == "faq"] | order(order asc){
    _id,
    question,
    answer,
    order
  }`,
)

export const SERVICES_QUERY = defineQuery(
  `*[_type == "service" && defined(slug.current)] | order(title asc){
    _id,
    title,
    slug,
    shortTitle,
    navLabel,
    description,
    heroIntro,
    quoteServiceValue,
    image,
    gallery[]{_key, asset, alt},
    overview,
    includes,
    benefits[]{_key, title, text},
    process[]{_key, step, text}
  }`,
)
