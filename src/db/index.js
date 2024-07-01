
import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'

const connectDB = async() => {
    try {
        const connctionType = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`mongoDB connected succesfully ||| `,connctionType.connection.host)
    } catch (error) {
        console.log(`mongodb connection failes due to ${error}`)
        process.exit(1)
    }
}

export default connectDB