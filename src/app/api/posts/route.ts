import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const category = req.nextUrl.searchParams.get("category");

  if (slug) {
    const post = await db.post.findUnique({ where: { slug } });
    if (!post || !post.published) {
      return NextResponse.json({ ok: false, message: "Article introuvable." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, post: { ...post, content: JSON.parse(post.content) } });
  }

  const posts = await db.post.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    ok: true,
    posts: posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      category: p.category,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      authorName: p.authorName,
      createdAt: p.createdAt,
    })),
  });
}
