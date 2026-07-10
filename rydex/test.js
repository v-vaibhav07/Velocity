const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://USERNAME:PASSWORD@cluster0.a0ajqxu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => {
  console.log("✅ Connected");
  process.exit(0);
})
.catch((err) => {
  console.error("❌ Error:", err);
});