import mongoose,{model, Schema, Types} from "mongoose";

const subcriptionSchema = new Schema({
    subscriber : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    chnnel : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
},{timestamps:true})

export const Subscription =mongoose.model("Subscription",subcriptionSchema)