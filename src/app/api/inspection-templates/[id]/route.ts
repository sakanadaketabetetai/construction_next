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

  const { id } = await Promise.resolve(context.params);

  try {
    const template = await prisma.inspectionTemplate.findUnique({
      where: { id },
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
    });

    if (!template) {
      return new NextResponse(
        JSON.stringify({ error: "テンプレートが見つかりません" }),
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to fetch inspection template:', error);
    return new NextResponse(
      JSON.stringify({ error: "テンプレートの取得に失敗しました" }),
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

  const { id } = await Promise.resolve(context.params);
  const json = await request.json();
  const { name, description, items } = json;

  try {
    // 既存のアイテムと計測項目を削除
    await prisma.inspectionTemplateItem.deleteMany({
      where: { templateId: id },
    });

    // テンプレートとアイテムを更新
    const template = await prisma.inspectionTemplate.update({
      where: { id },
      data: {
        name,
        description,
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
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to update inspection template:', error);
    return new NextResponse(
      JSON.stringify({ error: "テンプレートの更新に失敗しました" }),
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

  const { id } = await Promise.resolve(context.params);

  try {
    await prisma.inspectionTemplate.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete inspection template:', error);
    return new NextResponse(
      JSON.stringify({ error: "テンプレートの削除に失敗しました" }),
      { status: 500 }
    );
  }
}