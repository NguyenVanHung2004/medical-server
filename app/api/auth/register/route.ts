import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import { User, UserRole } from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password, fullName, phone, role } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      passwordHash,
      fullName,
      phone,
      role: role || UserRole.PATIENT
    });

    await newUser.save();

    const token = signToken({ userId: newUser._id.toString(), role: newUser.role });

    return NextResponse.json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
