import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
    },
    cartItems: [
        {
            quantity: {
                type: Number,
                default: 1,
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        },
    ],
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
    },
}, {
    timestamps: true,
});

// Hash password before saving the user
userSchema.pre("save", async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) return next();

    try {
        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);  // Corrected method name
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Create the User model after defining the schema and pre-save hook
const User = mongoose.model("User", userSchema);

export default User;
