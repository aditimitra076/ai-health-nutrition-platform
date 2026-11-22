import mongoose from "mongoose";

const conncetDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully!");
        console.log(`Database: ${mongoose.connection.name}`);

    }catch(error){
        console.error("MongoDB conncetion failed: ", error.message);
        process.exit(1);

    }
};

export default conncetDB;