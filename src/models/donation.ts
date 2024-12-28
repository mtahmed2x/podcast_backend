import { DonationSchema } from "@schemas/donation";
import { model, Schema } from "mongoose";

const donationSchema = new Schema<DonationSchema>({
    creator: {
        type: Schema.Types.ObjectId,
        ref: "Creator",
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
});

const Donation = model("Donation", donationSchema);
export default Donation;
