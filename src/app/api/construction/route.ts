import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const fiscalYear = searchParams.get('fiscalYear');
  const title = searchParams.get('title');
  const targetEquipment = searchParams.get('targetEquipment');
  const status = searchParams.get('status');

  const where: any = {};

  if (fiscalYear) {
    where.fiscalYear = parseInt(fiscalYear);
  }
  if (title) {
    where.title = {
      contains: title,
      mode: 'insensitive',
    };
  }
  if (targetEquipment) {
    where.targetEquipment = {
      contains: targetEquipment,
      mode: 'insensitive',
    };
  }
  if (status) {
    where.status = status;
  }

  try {
    const projects = await prisma.constructionProject.findMany({
      where,
      orderBy: [
        { fiscalYear: 'desc' },
        { startDate: 'desc' },
      ],
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch construction projects:', error);
    return new NextResponse(
      JSON.stringify({ error: "工事情報の取得に失敗しました" }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string
      }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "ユーザーが見つかりません" }),
        { status: 404 }
      );
    }

    const json = await request.json();
    const { equipmentIds, ...projectData } = json;

    const project = await prisma.constructionProject.create({
      data: {
        ...projectData,
        createdById: user.id,
        equipment: {
          connect: equipmentIds.map((id: string) => ({ id }))
        }
      },
      include: {
        equipment: true
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to create construction project:', error);
    return new NextResponse(
      JSON.stringify({ error: "工事情報の登録に失敗しました" }),
      { status: 500 }
    );
  }
}