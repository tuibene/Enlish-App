const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PlacementConfig = require('./src/models/PlacementConfig');

dotenv.config();

const updateConfig = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected.');

        // Delete existing configs to force creation with new defaults
        await PlacementConfig.deleteMany({});
        console.log('Deleted existing placement configs.');

        // Create new default config
        await PlacementConfig.create({});
        console.log('Created new professional placement config.');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

updateConfig();
