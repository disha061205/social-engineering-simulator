import "dotenv/config";
import app from "./app";
import { connectDB } from "./utils/db";

const PORT = 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
