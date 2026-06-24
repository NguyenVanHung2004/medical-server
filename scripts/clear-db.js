const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' }); // Dành cho chạy ở local nếu có file .env.local

// Ưu tiên biến môi trường MONGODB_URI có sẵn khi chạy trên Zeabur
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ LỖI: Không tìm thấy MONGODB_URI.");
  console.error("Vui lòng truyền biến môi trường, ví dụ: MONGODB_URI=mongodb://... node scripts/clear-db.js");
  process.exit(1);
}

async function clearDB() {
  try {
    console.log("🔄 Đang kết nối tới MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Kết nối thành công!");

    console.log("🗑️ Đang tiến hành xóa dữ liệu...");
    // Lấy danh sách tất cả các collection đang có
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
       console.log("ℹ️ Database hiện đang trống, không có gì để xóa.");
    }

    for (let collection of collections) {
      const collectionName = collection.name;
      await mongoose.connection.collection(collectionName).deleteMany({});
      console.log(`- Đã xóa trắng collection: ${collectionName}`);
    }

    console.log("🎉 Hoàn tất xóa toàn bộ dữ liệu trong Database!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi khi xóa database:", err);
    process.exit(1);
  }
}

clearDB();
