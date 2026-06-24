import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const notifications = await Notification.find({ userId: auth.userId }).sort({ createdAt: -1 });

    const formatted = notifications.map(n => ({
      id: n._id,
      title: n.title,
      message: n.message,
      time: n.createdAt,
      isRead: n.isRead,
      type: n.type
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
