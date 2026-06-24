import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { verifyAuth } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const auth = verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    await Notification.updateMany(
      { userId: auth.userId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
