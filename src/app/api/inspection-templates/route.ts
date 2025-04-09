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

  try {
    const templates = await prisma.inspectionTemplate.findMany({
      include: {
        items: {
          include: {
            measurementFields: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        createdBy: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch inspection templates:', error);
    return new NextResponse(
      JSON.stringify({ error: "点検テンプレートの取得に失敗しました" }),
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
        email: session.user?.email as string,
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "ユーザーが見つかりません" }),
        { status: 404 }
      );
    }

    const json = await request.json();
    const { name, description, items } = json;

    const template = await prisma.inspectionTemplate.create({
      data: {
        name,
        description,
        createdById: user.id,
        items: {
          create: items.map((item: any, index: number) => ({
            itemName: item.itemName,
            description: item.description,
            required: item.required,
            order: index + 1,
            measurementFields: {
              create: item.measurementFields.map((field: any) => ({
                name: field.name,
                type: field.type,
                unit: field.unit,
                minValue: field.minValue,
                maxValue: field.maxValue,
              })),
            },
          })),
        },
      },
      include: {
        items: {
          include: {
            measurementFields: true,
          },
        },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to create inspection template:', error);
    return new NextResponse(
      JSON.stringify({ error: "点検テンプレートの作成に失敗しました" }),
      { status: 500 }
    );
  }
}