import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  const params = context.params;
  const { id } = await params;

  try {
    const project = await prisma.constructionProject.findUnique({
      where: { id },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ error: "工事情報が見つかりません" }),
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to fetch construction project:', error);
    return new NextResponse(
      JSON.stringify({ error: "工事情報の取得に失敗しました" }),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  try {
    const { id } = context.params;
    const json = await request.json();

    const project = await prisma.constructionProject.update({
      where: { id },
      data: {
        ...json,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to update construction project:', error);
    return new NextResponse(
      JSON.stringify({ error: "工事情報の更新に失敗しました" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  const { id } = context.params;

  try {
    await prisma.constructionProject.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete construction project:', error);
    return new NextResponse(
      JSON.stringify({ error: "設備の削除に失敗しました" }),
      { status: 500 }
    );
  }
}