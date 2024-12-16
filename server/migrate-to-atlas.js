import mongoose from 'mongoose';

// Source (Local) MongoDB connection string
const sourceUri = 'mongodb://localhost:27017/Automatic_Disbursement_Voucher_System';

// Destination (Atlas) MongoDB connection string
const destUri = 'mongodb+srv://2201102322:2ekMBJxS4wlmRLEU@cluster0.ddrcb.mongodb.net/Automatic_Disbursement_Voucher_System';

// Collections to migrate
const collections = ['admins', 'authentications', 'counters', 'staffs', 'tasks', 'users', 'vouchers'];

// Create a basic schema for dynamic collections
const DynamicSchema = new mongoose.Schema({}, { strict: false });

async function migrateData() {
    try {
        // Connect to source database
        const sourceDb = await mongoose.createConnection(sourceUri);
        console.log('Connected to source database');

        // Connect to destination database
        const destDb = await mongoose.createConnection(destUri);
        console.log('Connected to destination database');

        // Migrate each collection
        for (const collectionName of collections) {
            console.log(`Migrating ${collectionName}...`);
            
            // Create models for both connections using the dynamic schema
            const SourceModel = sourceDb.model(collectionName, DynamicSchema);
            const DestModel = destDb.model(collectionName, DynamicSchema);
            
            // Get all documents from source collection
            const documents = await SourceModel.find({}).lean();
            
            if (documents.length > 0) {
                // Insert documents into destination collection
                await DestModel.insertMany(documents);
                console.log(` Migrated ${documents.length} documents from ${collectionName}`);
            } else {
                console.log(`- No documents found in ${collectionName}`);
            }
        }

        console.log('Migration completed successfully!');
        
        // Close connections
        await sourceDb.close();
        await destDb.close();
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateData();
