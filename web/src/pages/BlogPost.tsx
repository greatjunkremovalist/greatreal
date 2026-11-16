import React, {useEffect, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {PortableText} from '@portabletext/react'
import {ArrowLeft, Calendar} from 'lucide-react'
import {CtaBanner} from '../components/CtaBanner'
import {SeoHead} from '../components/SeoHead'
import {fetchSanity} from '../lib/sanity/fetch'
import {urlFor} from '../lib/sanity/image'
import {POST_QUERY} from '../lib/sanity/queries'

type SanityPost = {
  _id: string
  title: string
  excerpt?: string
  category?: string
  publishedAt?: string
  image?: {alt?: string; asset?: unknown}
  body?: unknown[]
}

interface BlogPostProps {
  onOpenCall: () => void
}

export const BlogPost: React.FC<BlogPostProps> = ({onOpenCall}) => {
  const {slug} = useParams<{slug: string}>()
  const navigate = useNavigate()
  const [post, setPost] = useState<SanityPost | null | undefined>(undefined)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    fetchSanity<SanityPost | null>(POST_QUERY, {slug}).then((data) => {
      if (!cancelled) setPost(data)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (post === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-600">
        Loading…
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-800">That article was not found.</p>
        <Link to="/blog" className="font-bold text-[#559400] underline">
          Back to blog
        </Link>
      </div>
    )
  }

  const imageUrl = post.image ? urlFor(post.image as never).width(1600).url() : ''
  const dateLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

  return (
    <>
      <SeoHead
        title={`${post.title} | Great Junk Removalist Blog`}
        description={post.excerpt || post.title}
      />

      <article className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm font-bold text-[#559400] hover:text-[#091b2f]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to blog
          </Link>
          {post.category ? (
            <p className="mt-6 text-xs font-extrabold uppercase tracking-wider text-[#559400]">
              {post.category}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-[#091b2f]">
            {post.title}
          </h1>
          {dateLabel ? (
            <p className="mt-4 flex items-center text-slate-700 text-sm font-medium">
              <Calendar className="w-4 h-4 mr-2" />
              {dateLabel}
            </p>
          ) : null}
        </div>

        {imageUrl ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <img
              src={imageUrl}
              alt={post.image?.alt || post.title}
              className="w-full rounded-2xl object-cover max-h-[480px]"
            />
          </div>
        ) : null}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-slate max-w-none">
          {Array.isArray(post.body) ? <PortableText value={post.body} /> : null}
        </div>
      </article>

      <CtaBanner onQuoteClick={() => navigate('/quote')} onCallClick={onOpenCall} />
    </>
  )
}
